/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/// <reference path="../vendor/jquery.d.ts" />
/// <reference path="../vendor/jquery.terminal.d.ts" />
/// <reference path="../vendor/lodash.d.ts" />
/// <reference path="../vendor/strophe.d.ts" />

module Chat {
    var minMessageBufferSize = 50;
    var messageBufferSize = minMessageBufferSize;
    var $chatRooms: JQuery;
    var $otherChatRoomsContainer: JQuery;
    var $otherChatRooms: JQuery;
    var $chatBox: JQuery;
    var $chatInput: JQuery;
    var hasScrolled = {};
    var rooms = {};
    var selectedRoom = null;

    var MAX_TABS = 4;

    function createRoom(room) {
        if (rooms.hasOwnProperty(room)) return;

        var $tab = $('<li>').attr('id', room + '-tab').addClass('chat-tab ' + room).prependTo($chatRooms);

        var $a = $('<a>').attr('href', '#' + room).text(room).click(clickRoom).appendTo($tab);

        if (0 > $a[0].clientWidth - $a[0].scrollWidth) {
            $a.css('padding-right', 0);
        }

        $('<a>').attr('href', '#').addClass('btn-close').click(() => leaveRoom(room)).appendTo($tab);

        var $text = $('<div>').attr({
            'id': room + '-text',
            'data-channel': room
        }).addClass('chat-text').scroll(onChatTextScroll).prependTo($chatBox);

        rooms[room] = {
            $tab: $tab, $text: $text
        };
    }

    function joinRoom(room) {
        createRoom(room);
        selectRoom(room);
    }

    function leaveRoom(room) {
        if (!rooms.hasOwnProperty(room)) return;

        var $room = rooms[room];

        $room.$text.remove();

        $room.$tab.remove();

        delete rooms[room];

        if ($chatRooms.children().length < MAX_TABS) {
            $otherChatRooms.children(':first').appendTo($chatRooms);
        }

        var hasOtherChatRooms = $otherChatRooms.children().length > 0;

        $otherChatRoomsContainer.css('display', hasOtherChatRooms ? 'block' : 'none');

        if (!$chatRooms.children('.selected').length && Object.keys(rooms).length) {
            var firstRoom = $chatRooms.children(':first').text();
            if (firstRoom) selectRoom(firstRoom);
        }
    }

    function clickRoom(e) {
        e.preventDefault();

        hideOtherChatRooms();

        var channel = $(this).attr('href').substring(1);

        selectRoom(channel);

        return false;
    }

    function selectRoom(room) {
        if (selectedRoom === room) return;

        selectedRoom = room;

        $chatInput.removeClass().addClass(room).attr('placeholder', '[' + room + ']');

        var $room = getRoom(room);
        var $roomText = $room.$text;
        var $roomTab = $room.$tab;

        $roomTab.removeClass('highlight');

        if (!$.contains($chatRooms[0], $roomTab[0])) {
            $roomTab.prependTo($chatRooms);
        }

        $roomTab.addClass('selected').siblings().removeClass('selected');

        $roomText.css('display', 'block').siblings().css('display', 'none');

        tryScrollToBottom(room, $roomText);

        var otherChatRooms = [];

        var hasOtherChatRooms = false;

        $chatRooms.children().not($roomTab).each((i, tab) => {
            if (i < MAX_TABS - 1) return;

            hasOtherChatRooms = true;

            $otherChatRooms.append(tab);

            otherChatRooms.push(tab);
        });

        if (!hasOtherChatRooms) {
            hasOtherChatRooms = $otherChatRooms.children().length > 0;
        }

        $otherChatRoomsContainer.css('display', hasOtherChatRooms ? 'block' : 'none');
    }

    function getRoom(room): any {
        return room && rooms.hasOwnProperty(room) ? rooms[room] : null;
    }

    function tryScrollToBottom(channel, $channelText) {
        if (!hasScrolled[channel] && $channelText && $channelText.length) {
            $channelText.scrollTop($channelText[0].scrollHeight);
        }
    }

    function hideOtherChatRooms() {
        $otherChatRooms.css('display', 'none');
    }

    function appendChat(channel, $chatMessage, channelClass, iconClass) {
        // This appends the chat item and escapes it
        // TODO: make a smarter process for escaping chat so we can embed some html
        var $room = getRoom(channel);
        var $roomText = $room.$text;
        if (selectedRoom !== channel) {
            $room.$tab.addClass('highlight');
        }
        var $newChatItem = $('<div>').addClass('chat-item ' + (channelClass || ''));
        if (iconClass) $newChatItem.append($('<div>').addClass(iconClass));
        $newChatItem.append($chatMessage).appendTo($roomText);
        var $msgs = $('.chat-item', $roomText);
        while ($msgs.length > messageBufferSize) {
            $msgs.first().remove();
            $msgs = $('.chat-item', $roomText);
        }

        tryScrollToBottom($roomText.attr('data-channel'), $roomText);
    }

    function setTextEntryMode(mode) {
        $chatInput.attr('data-command-mode', mode.toString());
    }
    
    function onChat(type, from, body, nick, iscse) {
        messageBufferSize = Math.max(minMessageBufferSize, messageBufferSize - 1);

        var $channelName = null;
        var $displayName = null;
        var $chatBody = $('<span>').addClass('chat-body');

        var channel = '';
        var channelName = '';
        var channelClass = '';
        var displayName = '';
        var iconClass = null;

        var jid: JID;
        switch (type) {
            case XmppMessageType.CHAT:
                jid = new JID(from);
                displayName = jid.user;
                if (nick) displayName = nick;
                channelName = 'IM';
                channelClass = 'im-chat';
                $chatBody.text(body);
                break;
            case XmppMessageType.GROUPCHAT:
                jid = new JID(from);
                channel = jid.user;
                channelClass = channel;
                switch (jid.user) {
                    case '_combat':
                        channelName = 'combat';
                        $chatBody.text(body);
                        break;
                    default:
                        channelName = jid.user;
                        displayName = jid.resource;
                        if (nick) displayName = nick;
                        if (iscse) iconClass = 'iscse';
                        $chatBody.text(body);
                        break;
                }
                break;
            default:
                $chatBody.text('got unknown(' + type + ') from: ' + from + ': ' + body);
        }

        if (channelName) {
            $channelName = $('<span>').addClass('chat-channel').text('[' + channelName + '] ');
        }

        if (displayName) {
            $displayName = $('<span>').addClass('chat-name').text('[' + displayName + ']: ');
        }
        
        appendChat(channel, [$channelName, $displayName, $chatBody], channelClass, iconClass);
    }

    function onSubmitChat(event) {
        // when enter key is pressed
        if (event.which == 13) {
            var body = $chatInput.val();
            var commandMode = $chatInput.attr('data-command-mode') || '0';
            if (body && body.length) {
                if (event.shiftKey || commandMode == '1') {
                    var $command = $('<div>').text(body).addClass('console-body command');
                    appendChat(selectedRoom, $command, null, null);
                    cu.ConsoleCommand(body);
                } else {
                    processCommandLine(body, event);
                }
            }
            $chatInput.val('');
            if (event.shiftKey) {
                setTextEntryMode(1);
            } else {
                setTextEntryMode(0);
                $chatInput.blur();
            }
        }
    }

    function onFocus() {
        cu.RequestInputOwnership();
    }

    function onBlur() {
        cu.ReleaseInputOwnership();
    }

    function onBeginChat(cmdKind, initText) {
        $chatInput.focus();
        $chatInput.val(initText ? initText : '');
        setTextEntryMode(cmdKind);
    }

    function onConsoleText(output) {
        var lines = output.split(/[\r\n]+/);
        var len = lines.length;
        messageBufferSize = Math.max(minMessageBufferSize, messageBufferSize + len - 2);
        for (var i = 0; i < len; ++i) {
            var $command = $('<div>').text(lines[i]).addClass('console-body output');
            appendChat(selectedRoom, $command, null, null);
        }
    }

    // By putting this in the javascript our players could change the command names to whatever they
    // wanted "/tell" could be replaced with "/message", "/quit" could be replaced with "/gtfo".  I don't
    // think we have a problem with this, but it could cause miscommunication between people using
    // different mods/plugins and potentially make things more difficult for our CSRs.
    function processCommandLine(input, event) {
        // Make sure we've got jQuery.terminal (for command processing)
        if (typeof $.terminal == 'undefined') return false;

        // If we don't have a leading slash or we held shift while sending the command,
        // we just send a chat message to the default channel (global for now)
        if (input.substring(0, 1) != '/' || event.shiftKey) {
            var room = selectedRoom;
            if (!room) {
                room = cu.GLOBAL_CHATROOM_NAME;
            }
            cu.SendChat(XmppMessageType.GROUPCHAT, room + '@' + cu.CHAT_SERVICE, input);
            return true;
        }

        var processed = $.terminal.parseCommand(input);
        var to;
        var body;
        var name;
        var channel;
        switch (processed.name) {
            case '/join':
                if (processed.args.length < 1) return false;
                channel = processed.args[0];
                cu.JoinMUC(channel);
                joinRoom(channel);
                return true;
            case '/leave':
                if (processed.args.length < 1) return false;
                channel = processed.args[0];
                cu.LeaveMUC(channel);
                leaveRoom(channel);
                return true;
            case '/muc':
                if (processed.args.length < 2) return false;
                to = processed.args[0] + '@' + cu.CHAT_SERVICE;
                body = everythingAfterArg(input, processed, 0);
                cu.SendChat(XmppMessageType.GROUPCHAT, to, body);
                return true;
            case '/quit':
                cuAPI.Quit();
                return true;
            case '/tell':
            case '/whisper':
                if (processed.args.length < 2) return false;
                to = processed.args[0];
                body = everythingAfterArg(input, processed, 0);
                cu.SendChat(XmppMessageType.CHAT, to, body);
                return true;
            case '/realm':
                if (!cu.HasAPI()) return false;
                if (processed.args.length < 1) return false;
                channel = cu.GetFactionChannel(cuAPI.faction);
                if (channel == null) return false;
                to = channel + '@' + cu.CHAT_SERVICE;
                body = processed.rest;
                cu.SendChat(XmppMessageType.GROUPCHAT, to, body);
                return true;
            case '/openui':
                if (processed.args.length < 1) return false;
                name = processed.args[0];
                if (name.indexOf('.ui') === -1) {
                    name = name + '.ui';
                }
                cuAPI.OpenUI(name);
                return true;
            case '/closeui':
                if (processed.args.length < 1) return false;
                name = processed.args[0];
                var uiIndex = name.indexOf('.ui');
                if (uiIndex !== -1) {
                    name = name.substring(0, uiIndex);
                }
                cuAPI.CloseUI(name);
                return true;
            case '/stuck':
                cuAPI.Stuck();
                return true;
            case '/zone':
                cuAPI.ChangeZone(parseInt(processed.args[0]));
                return true;
            case '/crashthegame':
                cuAPI.CrashTheGame();
                return true;
            case '/loc':
                onConsoleText(cuAPI.locationX + ',' + cuAPI.locationY + ',' + cuAPI.locationZ);
                return true;
            default:
                return false;
        }
    }

    function everythingAfterArg(input, processed, argNum) {
        // Start at the beginning of the string, and ignore any leading whitespace then match
        // on the command, require atleast one whitespace, and ignore the rest of the whitespace
        var regexStr = '^\\s*' + processed.name + '\\s+';

        // For each argument capture if there are leading quotes, ignore any leading whitespace,
        // check for the argument, ignore any trailing whitespace, check for a trailing quote
        // (if there was a leading quote), then require atleast one whitespace and ignore
        // the rest of the whitespace
        // TODO: javascript's regex doesn't support conditionals so I can't require a closing
        // quote if an opening quote is present, so we'll have to live without it for now
        // There are libraries like XRegExp which extend RegExp to include some of these
        // features, but it's probably overkill for now
        for (var i = 0; i <= argNum; ++i) {
            regexStr += '\"?\\s*' + processed.args[i] + '\\s*\"?\\s+';
        }

        var regex = new RegExp(regexStr);

        var output = $.trim(input.replace(regex, ''));
        return output;
    }

    function onChatTextScroll() {
        var $this = $(this);
        var channel = $this.attr('data-channel');
        var scrolled = !($this.scrollTop() + $this.innerHeight() >= $this[0].scrollHeight - 10);
        hasScrolled[channel] = scrolled;
    }

    export function connect(loginToken: string) {
        var jid: JID = new JID(cu.CHAT_DOMAIN);

        jid.EnsureHasDomain();

        cu.CreateWebSocket(loginToken, jid.domain,
            () => cu.JoinRoomAsCurrentUser(cu.GLOBAL_CHATROOM),
            () => onConsoleText('Connected to chat!'));
    }

    export function disconnect() {
        cu.DestroyWebSocket();
    };

    cu.OnInitialized(() => {
        $(document).keydown(e => {
            if (e.keyCode === 27) { // escape key
                $chatInput.blur();
            }
        });

        $chatRooms = cu.FindElement('#chat-rooms');

        $otherChatRoomsContainer = cu.FindElement('#other-chat-rooms');
        
        $otherChatRoomsContainer.children('li').click((e) => {
            e.preventDefault();
            e.stopPropagation();

            $otherChatRooms.css('display', $otherChatRooms.is(':visible') ? 'none' : 'block');

            return false;
        });

        $otherChatRooms = cu.FindElement('ul', $otherChatRoomsContainer[0]);

        $chatBox = cu.FindElement('#chat-box');

        $chatBox.click(hideOtherChatRooms);

        $chatInput = cu.FindElement('#chat-input');

        $chatInput.focus(hideOtherChatRooms);

        cu.Listen('OnChat', onChat);
        cu.Listen('OnBeginChat', onBeginChat);
        cu.Listen('XmppAuthFailed', () => onConsoleText('Login failed'));

        $chatInput.keydown(onSubmitChat);
        $chatInput.focus(onFocus).blur(onBlur);

        var defaultRooms = [cu.GLOBAL_CHATROOM_NAME, cu.COMBAT_CHATROOM_NAME];

        if (cu.HasAPI()) {
            var factionChannel = cu.GetFactionChannel(cuAPI.faction);
            if (factionChannel) defaultRooms.push(factionChannel);
        }

        Array.prototype.slice.call(defaultRooms).reverse().forEach(createRoom);
        selectRoom(defaultRooms[0]);
    });

    cu.OnServerConnected(() => {
        if (cu.HasAPI()) {
            if (_.isFunction(cuAPI.OnChat)) {
                cuAPI.OnChat(onChat);
            }
            if (_.isFunction(cuAPI.OnBeginChat)) {
                cuAPI.OnBeginChat(onBeginChat);
            }
            if (_.isFunction(cuAPI.OnConsoleText)) {
                cuAPI.OnConsoleText(onConsoleText);
            }
        }
    });
}