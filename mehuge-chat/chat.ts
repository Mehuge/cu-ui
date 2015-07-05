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
        lastWhisper : string,
        showCombatMessages: boolean = true,
        cmdHistory: string[] = [], cmdhpos = -1;

    // channel list.  Note, : tells Mehuge chat API to join channel as-is, 
    // otherwise channel names are mangles
    var channels = [
        "_global", "_it", "_cube"
    ], selectedIndex = 0, faction;

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
        handler: function (name: string, args: any[]) {
            if (args.length) {
                cuAPI.ChangeZone(args[0]|0);
            }
        }
    };
    slash["togglecamera"] = {
        help: "toggles camera mode",
        handler: function (name: string, args: string[]) {
            cuAPI.ToggleCamera();
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
    slash["droplight"] = {
        help: "drop a light at your location, options: (colors are 0-255) droplight <intensity> <radius> <red> <green> <blue>",
        handler: function (name: string, args: any[]) {
            var intensity : number = args.length >= 0 ? args[0] : 1;
            var radius: number = args.length > 1 ? args[1] : 20;
            var red: number = args.length > 2 ? args[2] : 100;
            var green: number = args.length > 3 ? args[3] : 100;
            var blue: number = args.length > 4 ? args[4] : 100;
            cuAPI.DropLight(intensity, radius, red, green, blue);
        }
    };

    slash['resetlights'] = {
        help: 'removes all dropped lights from the world.',
        handler: function (name: string, args: string[]) {
            cuAPI.ResetLights();
        }
    };

    slash['fov'] = {
        help: 'set your field of view, client accepts values from 20 -> 179.9',
        handler: function (name: string, args: any[]) {
            var degrees = args.length >= 0 ? args[0]|0 : 120;
            cuAPI.FOV(degrees);
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

        // Track command history
        if (input.value.length > 0) {
            cmdHistory.unshift(input.value);
            if (cmdHistory.length > 20) cmdHistory.pop();
            cmdhpos = -1;
        }

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
        if (config.hideDeathSpam) {
            showCombatMessages = false;
        }
    }

    function autoexec(autoexec: any) {
        var runCommand = function (i) {
            if (i < autoexec.length) {
                var delay: number = 0;
                if (autoexec[i][0] === '/') {
                    console.log('exec ' + autoexec[i].substr(1));
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
                if (delay > 0) {
                    setTimeout(function () { runCommand(i + 1); }, delay);
                } else {
                    runCommand(i + 1);
                }
            }
        };
        runCommand(0);
    }

    function initChat() {

        var hasRunAutoexec = false, hasAskedForMOTD = false;

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
                if (!hasAskedForMOTD) {
                    MehugeChat.sendIM("!motd", "agoknee@chat.camelotunchained.com");
                    hasAskedForMOTD = true;
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
                if (msg.account === "chat.camelotunchained.com/Warning") {
                    msg.from = "announce";
                    msg.account = null;
                } else {
                    lastWhisper = msg.account;
                }
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
            } else if (ev.keyCode == 38) {
                cmdhpos++;
                if (cmdhpos < cmdHistory.length) {
                    input.value = cmdHistory[cmdhpos];
                } else {
                    input.value = '';
                    cmdhpos = -1;
                }
            } else if (ev.keyCode == 40) {
                cmdhpos--;
                if (cmdhpos >= 0) {
                    input.value = cmdHistory[cmdhpos];
                } else {
                    input.value = '';
                    cmdhpos = cmdHistory.length;
                }
            }
        });

        // handle focus and input ownership
        input.addEventListener("focus", (ev: Event) => {
            console.log('focus - grabbing input');
            cuAPI.RequestInputOwnership();
        });
        input.addEventListener("blur", (ev: Event) => {
            console.log('blur - releasing input');
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
        if (showCombatMessages) {
            cuAPI.OnChat((type: number, from: string, body: string, nick: string, iscse: boolean) => {
                if (iscse && from.substr(0, 8) === "_combat@") {
                    addMessage({ from: "_combat", message: body });
                }
            });
        }

        // Handle console text
        cuAPI.OnConsoleText((text: string) => {
            var lines: string[] = text.split("\n");
            if (lines[lines.length-1].length === 0) lines.pop();
            for (var i = 0; i < lines.length; i++) {
                addMessage({ from: "tty", message: lines[i] });
            }
        });

        // Set default channel
        setDefaultChannel();
    }

    function init() {
        cuAPI.OnCharacterFactionChanged((factionId: number) => {
            var f2s = function (id) {
                switch (id) {
                    case 1:
                        return "tdd";
                    case 2:
                        return "viking";
                    case 3:
                        return "arthurian";
                }
            }
            if (factionId !== -1) {
                if (!faction) {
                    faction = f2s(factionId);
                    channels.push(faction);
                    initChat();
                } else if (f2s(factionId) !== faction) {
                    alert('faction change not supported ... yet');
                }
            }
        });

        MehugeEvents.sub("chat-announce", (topic: string, ...data: any[]) => {
            for (var i = 0; i < data.length; i++) {
                addMessage({ from: "system", message: data[i] });
            }
        });

        MehugeEvents.sub("chat-register-slash", (topic: string, ...data: any[]) => {
            console.log('register new slash command ' + topic + ' ' + data[0]);
            slash[data[0]] = {
                help: data[1],
                handler: function (name: string, args: string[]) {
                    console.log('execute new slash command ', name, args);
                    MehugeEvents.pub("slash-" + name, args);
                }
            };
        });

        MehugeEvents.pub("chat-announce", "Mehuge Chat v1.0");
    }

    if (typeof cuAPI !== "undefined") {
        cuAPI.OnInitialized(function () {
            init();
        });
    } else {
        setTimeout(init, 100);
    }
}; 