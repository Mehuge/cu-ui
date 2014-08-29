/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/// <reference path="../vendor/jquery.d.ts" />
/// <reference path="../vendor/jquery.cookie.d.ts" />
/// <reference path="../vendor/jquery.terminal.d.ts" />
/// <reference path="../vendor/underscore.d.ts" />
/// <reference path="../vendor/strophe.d.ts" />

module Chat {
    var minMessageBufferSize = 50;
    var messageBufferSize = minMessageBufferSize;
    var $chatInput: JQuery;
    var $chatText: JQuery;
    var hasScrolled = false;
    var lastTellFrom: JID = null;

    function AppendChat(chatBody, iconClass) {
        // This appends the chat item and escapes it
        // TODO: make a smarter process for escaping chat so we can embed some html
        var newChatItem = $('<div/>').addClass('chatItem');
        if (iconClass) newChatItem.append($('<div/>').addClass(iconClass));
        newChatItem.append(chatBody);
        newChatItem.appendTo($chatText);
        var msgs = $('.chatItem');
        while (msgs.length > messageBufferSize) {
            msgs.first().remove();
            msgs = $('.chatItem');
        }

        if (!hasScrolled) {
            $chatText.scrollTop($chatText[0].scrollHeight);
        }
    }

    function SetTextEntryMode(mode) {
        $chatInput.attr('data-command-mode', mode.toString());
    }

    function OnChatCommand(command: string, to: string, body: string) {
        var msg;
        var msgClass = 'chatBody';
        switch (command) {
            case "/r":
            case "/whisper":
                msg = '[IM to] [' + to + ']: ' + body;
                msgClass = msgClass + ' imOutChat';
                break;
            default:
                break;
        }

        var chatBody = $('<div/>').text(msg).addClass(msgClass);
        AppendChat(chatBody, null);
    }

    function OnChat(type, from, body, nick, iscse) {
        var msg;
        var msgClass = 'chatBody';
        messageBufferSize = Math.max(minMessageBufferSize, messageBufferSize - 1);
        var displayName;
        var jid: JID;
        switch (type) {
            case XmppMessageType.CHAT:
                jid = new JID(from);
                displayName = jid.user;
                if (nick) displayName = nick;
                msg = '[IM from] [' + displayName + ']: ' + body;
                msgClass = msgClass + ' imChat';
                lastTellFrom = jid;
                break;
            case XmppMessageType.GROUPCHAT:
                jid = new JID(from);
                switch (jid.user) {
                    case '_combat':
                        msg = '[combat]: ' + body;
                        msgClass = msgClass + ' combatChat';
                        break;
                    default:
                        displayName = jid.resource;
                        if (nick) displayName = nick;
                        msg = '[' + jid.user + '] [' + displayName + ']: ' + body;
                        msgClass = msgClass + ' groupChat';
                        break;
                }
                break;
            default:
                msg = 'got unknown(' + type + ') from: ' + from + ': ' + body;
        }

        var chatBody = $('<div/>').text(msg).addClass(msgClass);
        var iconClass = (iscse ? 'iscse' : null);
        AppendChat(chatBody, iconClass);
    }

    function OnSubmitChat(event) {
        // when enter key is pressed
        if (event.which == 13) {
            var body = $chatInput.val();
            var commandMode = $chatInput.attr('data-command-mode') || '0';
            if (body && body.length) {
                if (event.shiftKey || commandMode == '1') {
                    var command = $('<div/>').text(body).addClass('consoleBody command');
                    AppendChat(command, null);
                    cu.ConsoleCommand(body);
                } else {
                    ProcessCommandLine(body, event);
                }
            }
            $chatInput.val('');
            if (event.shiftKey) {
                if (commandMode == '0') {
                    SetTextEntryMode(1);
                } else {
                    SetTextEntryMode(0);
                    $chatInput.blur();
                }
            } else {
                $chatInput.blur();
            }
        }
    }

    function OnFocus() {
        cu.RequestInputOwnership();
    }

    function OnBlur() {
        cu.ReleaseInputOwnership();
    }

    function OnBeginChat(cmdKind, initText) {
        $chatInput.focus();
        $chatInput.val(initText ? initText : '');
        SetTextEntryMode(cmdKind);
    }
    function AppendConsoleText(output) {
        OnConsoleText(output);
    }
    function OnConsoleText(output) {
        var lines = output.split(/[\r\n]+/);
        var len = lines.length;
        messageBufferSize = Math.max(minMessageBufferSize, messageBufferSize + len - 2);
        for (var i = 0; i < len; ++i) {
            var command = $('<div/>').text(lines[i]).addClass('consoleBody output');
            AppendChat(command, null);
        }
    }

    // By putting this in the javascript our players could change the command names to whatever they
    // wanted "/tell" could be replaced with "/message", "/quit" could be replaced with "/gtfo".  I don't
    // think we have a problem with this, but it could cause miscommunication between people using
    // different mods/plugins and potentially make things more difficult for our CSRs.
    function ProcessCommandLine(input, event) {
        // Make sure we've got jQuery.terminal (for command processing)
        if (typeof $.terminal == 'undefined') return false;

        // If we don't have a leading slash or we held shift while sending the command,
        // we just send a chat message to the default channel (global for now)
        if (input.substring(0, 1) != '/' || event.shiftKey) {
            cu.SendChat(XmppMessageType.GROUPCHAT, cu.GLOBAL_CHATROOM, input);
            return true;
        }

        var processed = $.terminal.parseCommand(input);
        var to;
        var body;
        var name;
        switch (processed.name) {
            case '/join':
                if (processed.args.length < 1) return false;
                cu.JoinMUC(processed.args[0]);
                return true;
            case '/leave':
                if (processed.args.length < 1) return false;
                cu.LeaveMUC(processed.args[0]);
                return true;
            case '/muc':
                if (processed.args.length < 2) return false;
                to = processed.args[0] + '@' + cu.CHAT_SERVICE;
                body = EverythingAfterArg(input, processed, 0);
                cu.SendChat(XmppMessageType.GROUPCHAT, to, body);
                return true;
            case '/quit':
                cuAPI.Quit();
                return true;
            case '/tell':
            case '/whisper':
                if (processed.args.length < 2) {
                    AppendConsoleText("Usage: " + processed.name + " <to> <message>");
                    return false;
                }

                to = processed.args[0];
                if (to.match('@' + cu.CHAT_DOMAIN)) {
                    to += '@' + cu.CHAT_DOMAIN;
                }
                body = EverythingAfterArg(input, processed, 0);
                cu.SendChat(XmppMessageType.CHAT, to, body);
                OnChatCommand(processed.name, processed.args[0], body);
                return true;
            case '/r':
                if (processed.args.length < 1) {
                    AppendConsoleText("Usage: " + processed.name + " <message>");
                    return false;
                }
                if (lastTellFrom) {
                    body = processed.rest;
                    cu.SendChat(XmppMessageType.CHAT, lastTellFrom.user + '@' + lastTellFrom.domain, body);
                    OnChatCommand(processed.name, lastTellFrom.user, body);
                } else {
                    AppendConsoleText("Found no one to reply to.");
                }
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
            case "/loc":
                AppendConsoleText(cuAPI.locationX + "," + cuAPI.locationY + "," + cuAPI.locationZ);
                break;
            default:
                return false;
        }
    }

    function EverythingAfterArg(input, processed, argNum) {
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

    function OnChatTextScroll() {
        var $this = $(this);
        hasScrolled = !($this.scrollTop() + $this.innerHeight() >= $this[0].scrollHeight);
    }

    export function Connect(loginToken: string) {
        var jid: JID = new JID(cu.CHAT_DOMAIN);

        jid.EnsureHasDomain();

        cu.CreateWebSocket(loginToken, jid.domain,
            () => cu.JoinRoomAsCurrentUser(cu.GLOBAL_CHATROOM),
            () => OnConsoleText('Connected to chat!'));
    }

    export function Disconnect() {
        cu.DestroyWebSocket();
    };

    cu.OnInitialized(() => {
        $chatInput = $('#chatInput');

        if (!$chatInput.length) return;

        $chatText = cu.FindElement('#chatText');

        $chatText.scroll(OnChatTextScroll);

        cu.Listen('OnChat', OnChat);
        cu.Listen('OnBeginChat', OnBeginChat);
        cu.Listen('XmppAuthFailed', () => OnConsoleText('Login failed'));

        $chatInput.keydown(OnSubmitChat);
        $chatInput.focus(OnFocus);
        $chatInput.blur(OnBlur);
    });

    cu.OnServerConnected(() => {
        if (cu.HasAPI()) {
            if (_.isFunction(cuAPI.OnChat)) {
                cuAPI.OnChat(OnChat);
            }
            if (_.isFunction(cuAPI.OnBeginChat)) {
                cuAPI.OnBeginChat(OnBeginChat);
            }
            if (_.isFunction(cuAPI.OnConsoleText)) {
                cuAPI.OnConsoleText(OnConsoleText);
            }
        }
    });
}