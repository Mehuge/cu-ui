declare var ChatConfig : any;

module Chat {

    var screenW, screenH,
        channel: any = document.getElementById("channel"),
        clicker: any = document.getElementById("clicker"),
        history = document.getElementById("history"),
        input: any = document.getElementById("input-box"),
        command: any = document.getElementById("command-box"),
        commandMode: boolean = false,
        savedText: string = "",
        lastWhisper;

    // channel list.  Note, : tells Mehuge chat API to join channel as-is, 
    // otherwise channel names are mangles
    var channels = [
        "_global", "_it", "_cube", "_combat"
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
                var c = channels.indexOf(args[0]);
                if (c === -1) {
                    MehugeChat.join(args[0]);
                } else {
                    selectChannel(c);
                }
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
        help: "talk in cube chat",
        handler: function (name: string, args: string[]) {
            if (args.length > 0) {
                MehugeChat.sendText(args.join(" "), "_cube");
            }
        }
    };
    slash["w"] = slash["whisper"] = slash["tell"] = {
        help: "Send personal message. e.g. /w mehuge hello",
        handler: function (name: string, args: string[], full: string) {
            if (args.length > 1) {
                var who = args.shift(), message = full.substr(who.length + 1);
                addMessage({ from: "IM", account: "me > " + who, message: message });
                MehugeChat.sendIM(message, who + "@chat.camelotunchained.com");
            }
        }
    };
    slash["ch"] = {
        help: "talk in named chat channel.  e.g. /ch _general hello general",
        handler: function (name: string, args: string[]) {
            if (args.length > 1) {
                var channel = args.shift();
                MehugeChat.sendText(args.join(" "), channel);
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
            if (msg.iscse) {
                var img: HTMLImageElement = document.createElement("img");
                img.className = "cse";
                img.src = "../images/chat/CSE_icon_badge.png";
                span.appendChild(img);
            }
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

    function doSlashCommand(full: string) {
        var args : string[] = full.split(" ");
        var command = slash[args[0]];
        if (command && command.handler) {
            var name = args.shift();
            command.handler(name, args, full.substr(name.length+1));
        }
    }

    function setCommandMode(on) {
        commandMode = on;
        command.className = on ? "command-mode" : "chat-mode";
    }

    function handleEnter(shift: boolean) {
        var run = function (cmd) {
            addMessage({ from: "console", message: cmd });
            cuAPI.ConsoleCommand(cmd);
        };
        // Is this a / command (slash commands work in or out of command mode)
        if (input.value[0] === '/') {
            doSlashCommand(input.value.substr(1));
            input.value = '';
        } else {
            // If not in command mode, and a command<shift+enter> is pressed
            if (!commandMode && shift && input.value.length) {
                // then run as a single command
                run(input.value);
            } else {
                var old = commandMode;
                // else check if we are toggling command mode
                if (shift) {
                    // toggle command mode
                    setCommandMode(!commandMode);
                }

                // Do we have something to run?
                if (input.value.length) {
                    // How we run it depends on command mode
                    if (commandMode) {
                        run(input.value);
                    } else {
                        MehugeChat.sendText(input.value, channels[selectedIndex]);
                    }
                } else {
                    // <ENTER> on empty input that wasn't a toggle, work same as ESC
                    if (old === commandMode) {
                        setCommandMode(false);
                        cuAPI.ReleaseInputOwnership();
                    }
                }
            }
        }
        input.value = '';
        input.focus();
    }

    function selectChannel(i) {
        channel.textContent = channels[i];
        channel.className = '_ch_' + channels[i];
        selectedIndex = i;
    }

    function setDefaultChannel() {
        if (cuAPI.serverURL && cuAPI.serverURL.indexOf("hatchery.") > -1) {
            selectChannel(1);
        } else {
            selectChannel(0);
        }
    }

    function processConfig(config: any) {
        var join = config.join;
        if (join) {
            for (var i = 0; i < join.length; i++) {
                channels.push(join[i]);
            }
        }
        var leave = config.leave;
        if (leave) {
            for (i = 0; i < leave.length; i++) {
                var c = channels.indexOf(leave[i]);
                if (c !== -1) channels.splice(c, 1);
            }
        }
    }

    function autoexec(autoexec: any) {
        var runCommand = function (i) {
            if (i < autoexec.length) {
                var delay: number = 100;
                if (autoexec[i][0] === '/') {
                    doSlashCommand(autoexec[i].substr(1));
                    if (autoexec[i].substr(0, 6) === "/join") {
                        delay = 500;
                    }
                } else {
                    if (autoexec[i].substr(0, 5) === "sleep") {
                        delay = autoexec[i].substr(6) | 0;
                    } else {
                        addMessage({ from: "console", message: autoexec[i] });
                        cuAPI.ConsoleCommand(autoexec[i]);
                        delay = 200;
                    }
                }
                setTimeout(function () { runCommand(i+1); }, delay);
            }
        };
        runCommand(0);
    }

    function init() {

        var hasRunAutoexec = false;

        var rebuildChannelUI = function () {
            // Add channels to dropdown
            var opts = '';
            for (var i = 0; i < channels.length; i++) {
                opts += '<option>' + channels[i] + '</option>';
            }
            channel.innerHTML = opts;
        };

        if (typeof ChatConfig !== "undefined") {
            processConfig(ChatConfig);
        }

        // Connect to chat channels
        try {
            MehugeChat.connect(cuAPI.loginToken, channels, function (channel:any) {
                addMessage({ from: 'system', message: 'connected to channel ' + channel.room });
                if (channels.indexOf(channel.room) == -1) {
                    channels.push(channel.room);
                    rebuildChannelUI();
                    selectChannel(channels.length - 1);
                }
                if (typeof ChatConfig !== "undefined" && ChatConfig.autoexec && !hasRunAutoexec) {
                    hasRunAutoexec = true;
                    setTimeout(function () {
                        autoexec(ChatConfig.autoexec);
                    }, 500);
                }
            });
        } catch (e) {
            addMessage({ from: 'error', message: e.message });
            debugger;
        }

        // Respond to chat
        MehugeChat.listen(["groupchat", "chat", "error", function (msg) {
            if (msg.type === "chat" && msg.from === "IM") {
                lastWhisper = msg.account;
            }
            addMessage(msg);
        }]);

        // Respond to sending chat
        input.addEventListener("keydown", (ev: KeyboardEvent) => {
            if (ev.keyCode === 13) {
                handleEnter(ev.shiftKey);
            } else if (ev.keyCode === 27) {
                setCommandMode(false);
                cuAPI.ReleaseInputOwnership();
            } else if (ev.keyCode === 8) {
                if (input.value === '' && lastWhisper) {
                    input.value = "/w " + lastWhisper + "  ";
                }
            }
        });

        // handle focus and input ownership
        input.addEventListener("focus", (ev: Event) => {
            cuAPI.RequestInputOwnership();
        });
        input.addEventListener("blur", (ev: Event) => {
            cuAPI.ReleaseInputOwnership();
            savedText = input.value;
        });

        clicker.addEventListener("click", (ev: MouseEvent) => {
            if (selectedIndex < channels.length - 1) {
                selectedIndex++;
            } else {
                selectedIndex = 0;
            }
            selectChannel(selectedIndex);
        });

        cuAPI.CloseUI("chat");

        // catch ENTER (or /)
        cuAPI.OnBeginChat((mode: number, text: string) => {
            input.focus();
            input.value = text ? text : savedText;
            commandMode = mode === 1;
            command.className = commandMode ? "command-mode" : "chat-mode";
        });

        // Handle combat messages
        cuAPI.OnChat((type: number, from: string, body: string, nick: string, iscse: boolean) => {
            if (iscse && from.substr(0, 8) === "_combat@") {
                addMessage({ from: "_combat", message: body });
            }
        });

        // Handle console text
        cuAPI.OnConsoleText((text: string) => {
            addMessage({ from: "console", message: text });
        });

        // Set default channel
        setDefaultChannel();
    }

    if (typeof cuAPI !== "undefined") {
        cuAPI.OnInitialized(function () {
            init();
        });
    } else {
        setTimeout(init, 100);
    }
}; 