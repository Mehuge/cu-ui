module MehugeChat {

    var screenW, screenH,
        channel: any = document.getElementById("channel"),
        clicker: any = document.getElementById("clicker"),
        history = document.getElementById("history"),
        input: any = document.getElementById("input-box"),
        command: any = document.getElementById("command-box"),
        commandMode = false;

    // channel list.  Note, : tells Mehuge chat API to join channel as-is, 
    // otherwise channel names are mangles
    var channels = [
        "_global", "_it", "_cube", "uidev", "*"
    ], selectedIndex = 0;

    // slash commands
    var slash = {};

    var _parseUIName = function (s: string): string {
        if (s.substr(-3) === ".ui") {
            s = s.substr(0, s.length - 3);
        }
        return s;
    };

    // Slash commands implementation:-
    slash["help"] = {
        help: "This help message",
        handler: function (name: string, args: string[]) {
            for (var command in slash) {
                addMessage({ from: "info", message: "/" + command + " - " + slash[command].help });
            }
        }
    };
    slash["openui"] = {
        help: "Open named UI",
        handler: function (name: string, args: string[]) {
            var name = _parseUIName(args[0]);
            if (name) {
                cuAPI.OpenUI(name + ".ui");
                if (name === "chat") cuAPI.CloseUI("mehuge-chat");
            }
        }
    };
    slash["closeui"] = {
        help: "Close a named UI",
        handler: function (name: string, args: string[]) {
            var name = _parseUIName(args[0]);
            if (name) {
                if (name === "mehuge-chat") cuAPI.OpenUI("chat.ui");
                cuAPI.CloseUI(name);
            }
        }
    };
    slash["showui"] = {
        help: "Show named UI",
        handler: function (name: string, args: string[]) {
            var name = _parseUIName(args[0]);
            if (name) {
                cuAPI.ShowUI(name);
            }
        }
    };
    slash["hideui"] = {
        help: "Hide a named UI",
        handler: function (name: string, args: string[]) {
            var name = _parseUIName(args[0]);
            if (name) {
                cuAPI.HideUI(name);
            }
        }
    };
    slash["loc"] = {
        help: "Show current location",
        handler: function (name: string, args: string[]) {
            addMessage({ from: "system", message: cuAPI.locationX + ',' + cuAPI.locationY + ',' + cuAPI.locationZ });
        }
    };
    slash["stuck"] = {
        help: "Gets your character unstuck",
        handler: function (name: string, args: string[]) {
            cuAPI.Stuck();
        }
    };
    slash["zone"] = {
        help: "Gets your character unstuck",
        handler: function (name: string, args: string[]) {
            if (args.length) {
                cuAPI.ChangeZone(parseInt(args[0]));
            }
        }
    };
    slash["crashthegame"] = {
        help: "Crashes the game (awesome!)",
        handler: function (name: string, args: string[]) {
            cuAPI.CrashTheGame();
        }
    };
    slash["dance1"] = {
        help: "performs dance emote 1",
        handler: function (name: string, args: string[]) {
            cuAPI.Emote(0);
        }
    };
    slash["dance2"] = {
        help: "performs dance emote 2",
        handler: function (name: string, args: string[]) {
            cuAPI.Emote(1);
        }
    };
    slash["wave1"] = {
        help: "performs wave emote 1",
        handler: function (name: string, args: string[]) {
            cuAPI.Emote(2);
        }
    };
    slash["wave2"] = {
        help: "performs wave emote 2",
        handler: function (name: string, args: string[]) {
            cuAPI.Emote(3);
        }
    };
    slash["stop"] = {
        help: "stop emote",
        handler: function (name: string, args: string[]) {
            cuAPI.Emote(4);
        }
    };
    slash["join"] = {
        help: "join a chat channel",
        handler: function (name: string, args: string[]) {
            if (args.length > 0) {
                MehugeChat.join(args[0]);
            }
        }
    };
    slash["it"] = {
        help: "talk in IT chat",
        handler: function (name: string, args: string[]) {
            if (args.length > 0) {
                MehugeChat.sendText(args.join(" "), "_it");
            }
        }
    };
    slash["global"] = {
        help: "talk in global chat",
        handler: function (name: string, args: string[]) {
            if (args.length > 0) {
                MehugeChat.sendText(args.join(" "), "_global");
            }
        }
    };
    slash["cube"] = {
        help: "talk in global chat",
        handler: function (name: string, args: string[]) {
            if (args.length > 0) {
                MehugeChat.sendText(args.join(" "), "_cube");
            }
        }
    };
    slash["w"] = slash["whisper"] = slash["tell"] = {
        help: "Send personal message",
        handler: function (name: string, args: string[], full: string) {
            if (args.length > 1) {
                var who = args.shift(), message = full.substr(who.length + 1);
                addMessage({ from: "IM", account: "me > " + who, message: message });
                MehugeChat.sendIM(message, who + "@chat.camelotunchained.com");
            }
        }
    };

    // Add a message to chat window. The msg argument contains the details of the
    // message.
    //      {   from: "<room>",
    //          account: "<user account>",          // optional
    //          message: "<message text>"
    //      }
    export function addMessage(msg: any) {
        var div = document.createElement("div");
        div.className = 'entry _ch_' + msg.from;
        var span = document.createElement("span");
        span.className = 'room';
        var span2 = document.createElement("span");
        span2.innerText = msg.from + ':';
        span2.className = '_ch_' + msg.from;
        span.appendChild(span2);
        div.appendChild(span);
        if (msg.account) {
            span = document.createElement("span");
            span.className = 'account';
            span2 = document.createElement("span");
            span2.innerText = '[' + msg.account + ']';
            span2.className = '_ch_' + msg.from;
            span.appendChild(span2);
            div.appendChild(span);
        }
        span = document.createElement("span");
        span.innerText = msg.message;
        span.className = 'message';
        div.appendChild(span);
        history.appendChild(div);
        div.scrollIntoView();
        if (history.children.length > 250) {
            history.removeChild(history.children[0]);
        }
    }

    function doSlashCommand(args: string[]) {
        var command = slash[args[0]];
        if (command && command.handler) {
            var name = args.shift();
            command.handler(name, args, input.value.substr(name.length+1));
        }
    }

    function init() {

        var rebuildChannelUI = function () {
            // Add channels to dropdown
            var opts = '';
            for (var i = 0; i < channels.length; i++) {
                opts += '<option>' + channels[i] + '</option>';
            }
            channel.innerHTML = opts;
        };

        // Connect to chat channels
        try {
        MehugeChat.connect(cuAPI.loginToken, channels, function (channel:any) {
                addMessage({ from: 'system', message: 'connected to channel ' + channel.room });
                if (channels.indexOf(channel.room) == -1) {
                    channels.push(channel.room);
                    rebuildChannelUI();
                    selectChannel(channels.length - 1);
                }
            });
        } catch (e) {
            addMessage({ from: 'error', message: e.message });
            debugger;
        }

        // Respond to chat
        MehugeChat.listen([ "groupchat", "chat", "error", function (msg) {
            addMessage(msg);
        }]);

        // Respond to sending chat
        input.addEventListener("keyup", (ev: KeyboardEvent) => {
            if (ev.keyCode === 13) {
                var run = function (cmd) {
                    addMessage({ from: "_console", message: cmd });
                    cuAPI.ConsoleCommand(cmd);
                };
                if (input.value[0] === '/') {
                    doSlashCommand(input.value.substr(1).split(" "));
                    input.value = '';
                } else {
                    // If not in command mode, and a command<shift+enter> is pressed
                    // then run as a single command
                    if (!commandMode && ev.shiftKey && input.value.length) {
                        run(input.value);
                    } else {
                        if (ev.shiftKey) {
                            commandMode = !commandMode;
                            command.className = commandMode ? "command-mode" : "chat-mode";
                        }
                        if (input.value.length) {
                            if (commandMode) {
                                run(input.value);
                            } else {
                                MehugeChat.sendText(input.value, channels[selectedIndex]);
                            }
                            input.value = '';
                        }
                    }
                }
                input.value = '';
                input.focus();
            } else if (ev.keyCode === 27) {
                cuAPI.ReleaseInputOwnership();
            }
        });

        function selectChannel(i) {
            channel.textContent = channels[i];
            channel.className = '_ch_' + channels[i];
            selectedIndex = i;
        }

        // handle focus and input ownership
        input.addEventListener("focus", (ev: Event) => {
            console.log('RequestInputOwnership');
            cuAPI.RequestInputOwnership();
        });
        input.addEventListener("blur", (ev: Event) => {
            console.log('ReleaseInputOwnership');
            cuAPI.ReleaseInputOwnership();
        });

        clicker.addEventListener("click", (ev: MouseEvent) => {
            if (selectedIndex < channels.length - 1) {
                selectedIndex++;
            } else {
                selectedIndex = 0;
            }
            selectChannel(selectedIndex);
            //setTimeout(function () { input.focus(); }, 100);
        });

        // watch UI sizing
        window.addEventListener("resize", function () {
            screenW = window.innerWidth;
            screenH = window.innerHeight;
        });

        cuAPI.CloseUI("chat");

        if (cuAPI.serverURL && cuAPI.serverURL.indexOf("hatchery.") > -1) {
            selectChannel(1);
        } else {
            selectChannel(0);
        }

        // catch ENTER
        cuAPI.OnBeginChat((commandMode: number, text: string) => {
            input.focus();
        });

        cuAPI.OnChat((type: number, from: string, body: string, nick: string, iscse: boolean) => {
            if (iscse && from.substr(0, 8) === "_combat@") {
                addMessage({ from: "_combat", message: body });
            }
        });

        cuAPI.OnConsoleText((text: string) => {
            addMessage({ from: "_console", message: text });
        });
    }

    init();
}; 