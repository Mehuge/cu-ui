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
    var $chatTabs: JQuery;
    var $chatBox: JQuery;
    var $chatInput: JQuery;
    var hasScrolled = {};
    var rooms = {};
    var selectedRoom = null;
    var savedText = '';
    var faction: number = -1;
    var lastLinesSend = [];
    var lastLinesSendIndex = -1;

    var MAX_LINES_SEND_TO_KEEP = 2;
    var MAX_TABS = 7;

    function createTab(room) {
        if (!room || rooms.hasOwnProperty(room)) return;

        var $tab = $('<li>').attr('id', room + '-tab').addClass('chat-tab ' + room).appendTo($chatTabs);

        var $a = $('<a>').attr('href', '#' + room).text(room).click(clickTab).appendTo($tab);

        if (0 > $a[0].clientWidth - $a[0].scrollWidth) {
            $a.css('padding-right', 0);
        }

        var $text = $('<div>').attr({
            'id': room + '-text',
            'data-channel': room
        }).addClass('chat-text').scroll(onChatTextScroll).prependTo($chatBox);

        rooms[room] = {
            $tab: $tab, $text: $text
        };
    }

    function destroyTab(room) {
        if (!rooms.hasOwnProperty(room)) return;

        var $room = rooms[room];

        $room.$text.remove();

        $room.$tab.remove();

        delete rooms[room];
    }

    function joinRoom(room) {
        if (Object.keys(rooms).length >= MAX_TABS) {
            onConsoleText('You have already reached the maximum number of tabs.');
            return;
        }

        createTab(room);
        selectTab(room);
    }

    function leaveRoom(room) {
        destroyTab(room);

        if (selectedRoom == room) {
            selectedRoom = null;
        }

        if (!$chatTabs.children('.selected').length && Object.keys(rooms).length) {
            var firstRoom = $chatTabs.children(':first').text();
            if (firstRoom) selectTab(firstRoom);
        }
    }

    function clickTab(e) {
        e.preventDefault();

        var channel = $(this).attr('href').substring(1);

        selectTab(channel);

        return false;
    }

    function selectTab(roomName) {
        if (selectedRoom === roomName) return;

        selectedRoom = roomName;

        $chatInput.removeClass().addClass(roomName).attr('placeholder', roomName);

        var room = getRoom(roomName);

        if (!room) return;

        var $room = room.$room;

        if (!$room) return;

        var $roomText = $room.$text;
        var $roomTab = $room.$tab;

        $roomTab.removeClass('highlight').addClass('selected').siblings().removeClass('selected');

        $roomText.css('display', 'block').siblings().css('display', 'none');

        tryScrollToBottom(room, $roomText);
    }

    function getRoom(room): any {
        return room && rooms.hasOwnProperty(room) ? { name: room, $room: rooms[room] } : null;
    }

    function getGlobalRoom(): any {
        return getRoom('_global');
    }

    function getSelectedRoom(): any {
        return getRoom(selectedRoom);
    }

    function tryScrollToBottom(channel, $channelText) {
        if (!hasScrolled[channel] && $channelText && $channelText.length) {
            $channelText.scrollTop($channelText[0].scrollHeight);
        }
    }

    function appendChat(channel, $chatMessage, channelClass, iconClass) {
        // This appends the chat item and escapes it
        // TODO: make a smarter process for escaping chat so we can embed some html
        var room = getRoom(channel);
        if (!room) room = getGlobalRoom();
        if (!room) room = getSelectedRoom();
        if (!room) return;
        var $room = room.$room;
        var $roomText = $room.$text;
        if (selectedRoom !== room.name) {
            $room.$tab.addClass('highlight');
        }
        var $newChatItem = $('<div>').addClass('chat-item ' + (channelClass || ''));
        if (iconClass) $newChatItem.append($('<div>').addClass('chat-icon ' + iconClass));
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
            $displayName = $('<span>').addClass('chat-name').text(displayName + ': ');

            if (iscse) $displayName.addClass(iconClass);
        }
        
        appendChat(channel, [$channelName, $displayName, $chatBody], channelClass, iconClass);
    }

    function onSubmitChat(event) {
        // shift + Arrow Up/Down to cycle through last send texts
        if (cycleLastLinesSend(event)) {
            // nothing to do here
        }
        // when ESC is pressed: Abort and clear chat
        else if (event.which == 27) {
            $chatInput.val('');
            savedText = '';
            lastLinesSendIndex = -1;
        }
        // when enter key is pressed
        else if (event.which == 13) {
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
            savedText = '';
            if (event.shiftKey) {
                setTextEntryMode(1);
            } else {
                setTextEntryMode(0);
                $chatInput.blur();
            }
            addToLastSendLines(body);
        }
    }

    function addToLastSendLines(body) {
        if (body != "") {
            lastLinesSend.unshift(body);
            if (lastLinesSend.length > MAX_LINES_SEND_TO_KEEP) {
                lastLinesSend.pop();
            }
            lastLinesSendIndex = -1;
        }
    }

    function cycleLastLinesSend(event) {
        if (event.shiftKey && (event.which == 38 || event.which == 40)) {
            if (lastLinesSendIndex == -1) {
                savedText = $chatInput.val()
            }

            // cycle through last send lines using shift + Arrow Up/Down
            if (event.which == 38 && lastLinesSendIndex < (lastLinesSend.length - 1)) {
                lastLinesSendIndex++;
                $chatInput.val(lastLinesSend[lastLinesSendIndex]);
            
            }
            else if (event.which == 40 && lastLinesSendIndex >= 0) {
                lastLinesSendIndex--;
                if (lastLinesSendIndex < 0) {
                    $chatInput.val(savedText);
                }
                else {
                    $chatInput.val(lastLinesSend[lastLinesSendIndex]);
                }
            }
            return true;
        }
        return false;
    }

    function onFocus() {
        cu.RequestInputOwnership();
    }

    function onBlur() {
        cu.ReleaseInputOwnership();
        savedText = $chatInput.val();
    }

    function onBeginChat(cmdKind, initText) {
        $chatInput.focus();
        $chatInput.val(initText ? initText : savedText);
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

        var commandHandler = getSlashCommandHandler(processed.name.substring(1));

        return commandHandler ? commandHandler(processed, input) : false;
    }

    var slashCommands = {};

    function addSlashCommand(slashCommand: string, description: string, commandHandler: (processed: any, input: string) => boolean, shorthands = []): void {
        slashCommands[slashCommand] = { description: description, commandHandler: commandHandler, shorthands: shorthands };
    }

    function getSlashCommandHandler(slashCommand: string): (processed: any, input: string) => boolean {
        if (slashCommands.hasOwnProperty(slashCommand)) return slashCommands[slashCommand].commandHandler;
        for (var c in slashCommands) {
            var command = slashCommands[c];
            if (command.shorthands.indexOf(slashCommand) !== -1) {
                return command.commandHandler;
            }
        }
        return null;
    }

    addSlashCommand('help', 'show available slash commands', () => {
        _.each(slashCommands, (command: any, name: string) => {
            var text = '/' + name;

            if (command.shorthands && command.shorthands.length) {
                text += ' (/' + command.shorthands.join(', /') + ')';
            }
            
            if (command.description && command.description.length) {
                text += ' - ' + command.description;
            }

            onConsoleText(text);
        });
        return true;
    });

    addSlashCommand('join', 'join a chat room', (processed) => {
        if (processed.args.length < 1) return false;
        var channel = processed.args[0].toLowerCase();
        cu.JoinMUC(channel);
        joinRoom(channel);
        return true;
    });

    addSlashCommand('leave', 'leave a chat room', (processed) => {
        if (processed.args.length < 1) return false;
        var channel = processed.args[0].toLowerCase();
        cu.LeaveMUC(channel);
        leaveRoom(channel);
        return true;
    });

    addSlashCommand('muc', 'send a multi-user chat message', (processed, input) => {
        if (processed.args.length < 2) return false;
        var to = processed.args[0] + '@' + cu.CHAT_SERVICE;
        var body = everythingAfterArg(input, processed, 0);
        cu.SendChat(XmppMessageType.GROUPCHAT, to, body);
        return true;
    });

    addSlashCommand('quit', 'quit the game', () => {
        cuAPI.Quit();
        return true;
    });

    addSlashCommand('whisper', 'send a private message to another player', (processed, input) => {
        if (processed.args.length < 2) return false;
        var to = processed.args[0];
        var body = everythingAfterArg(input, processed, 0);
        cu.SendChat(XmppMessageType.CHAT, to, body);
        return true;
    }, [ 'tell', 'w' ]);

    addSlashCommand('realm', 'send a message to your entire realm', (processed) => {
        if (!faction) return false;
        if (!cu.HasAPI()) return false;
        if (processed.args.length < 1) return false;
        var channel = cu.GetFactionChannel(faction);
        if (channel == null) return false;
        var to = channel + '@' + cu.CHAT_SERVICE;
        var body = processed.rest;
        cu.SendChat(XmppMessageType.GROUPCHAT, to, body);
        return true;
    });

    addSlashCommand('openui', 'open a ui widget', (processed) => {
        if (processed.args.length < 1) return false;
        var name = processed.args[0];
        if (name.indexOf('.ui') === -1) {
            name = name + '.ui';
        }
        cuAPI.OpenUI(name);
        return true;
    });

    addSlashCommand('closeui', 'close a ui widget', (processed) => {
        if (processed.args.length < 1) return false;
        var name = processed.args[0];
        var uiIndex = name.indexOf('.ui');
        if (uiIndex !== -1) {
            name = name.substring(0, uiIndex);
        }
        cuAPI.CloseUI(name);
        return true;
    });

    addSlashCommand('showui', 'show a ui widget', (processed) => {
        if (processed.args.length < 1) return false;
        var name = processed.args[0];
        var uiIndex = name.indexOf('.ui');
        if (uiIndex !== -1) {
            name = name.substring(0, uiIndex);
        }
        cuAPI.ShowUI(name);
        return true;
    });

    addSlashCommand('hideui', 'hide a ui widget', (processed) => {
        if (processed.args.length < 1) return false;
        var name = processed.args[0];
        var uiIndex = name.indexOf('.ui');
        if (uiIndex !== -1) {
            name = name.substring(0, uiIndex);
        }
        cuAPI.HideUI(name);
        return true;
    });

    addSlashCommand('stuck', 'gets your character unstuck', () => {
        cuAPI.Stuck();
        return true;
    });

    addSlashCommand('zone', 'changes zone', (processed) => {
        cuAPI.ChangeZone(parseInt(processed.args[0]));
        return true;
    });

    addSlashCommand('crashthegame', 'crashes the game client', () => {
        cuAPI.CrashTheGame();
        return true;
    });

    addSlashCommand('loc', 'prints your current location', () => {
        onConsoleText(cuAPI.locationX + ',' + cuAPI.locationY + ',' + cuAPI.locationZ);
        return true;
    });

    addSlashCommand('dance1', 'performs dance emote 1', () => {
        cuAPI.Emote(cu.Emote.Dance1);
        return true;
    });

    addSlashCommand('dance2', 'performs dance emote 2', () => {
        cuAPI.Emote(cu.Emote.Dance2);
        return true;
    });

    addSlashCommand('wave1', 'performs wave emote 1', () => {
        cuAPI.Emote(cu.Emote.Wave1);
        return true;
    });

    addSlashCommand('wave2', 'performs wave emote 2', () => {
        cuAPI.Emote(cu.Emote.Wave2);
        return true;
    });

    addSlashCommand('stop', 'stop emote', () => {
        cuAPI.Emote(cu.Emote.Stop);
        return true;
    });

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

    function onCharacterFactionChanged(newFaction: number) {
        faction = newFaction;

        createTab(cu.GetFactionChannel(faction));
    }

    cu.OnInitialized(() => {
        $(document).keydown(e => {
            if (e.keyCode === 27) { // escape key
                $chatInput.blur();
            }
        });

        $chatTabs = cu.FindElement('#chat-tabs');

        $chatBox = cu.FindElement('#chat-box');

        $chatInput = cu.FindElement('#chat-input');

        cu.Listen('OnChat', onChat);
        cu.Listen('OnBeginChat', onBeginChat);
        cu.Listen('XmppAuthFailed', () => onConsoleText('Login failed'));

        $chatInput.keydown(onSubmitChat);
        $chatInput.focus(onFocus).blur(onBlur);

        var defaultRooms = [cu.GLOBAL_CHATROOM_NAME, cu.COMBAT_CHATROOM_NAME];
        Array.prototype.slice.call(defaultRooms).forEach(createTab);
        selectTab(defaultRooms[0]);
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
            if (_.isFunction(cuAPI.OnCharacterFactionChanged)) {
                cuAPI.OnCharacterFactionChanged(onCharacterFactionChanged);
            }
        }
    });
}
