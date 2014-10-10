/// <reference path="../vendor/jquery.d.ts" />
/// <reference path="../module-list.d.ts" />
/// <reference path="../vendor/jquery.d.ts" />

module Bot {

    var ml: JQuery = $('#editor');
    var socket: any;
    var connected: boolean;
    var STOP: boolean = false;

    // Initialise the UI (module list) and auto-load any modules marked as autoLoad true
    function _init() {
        // close the UI
        document.getElementById("close").onclick = () => cuAPI.CloseUI("bot");
        document.getElementById("run").onclick = () => run();
        document.getElementById("stop").onclick = () => {
            STOP = true;
        };
        var events = ["keydown", "keyup", "mousedown", "mouseup"];
        for (var i = 0; i < events.length; i++) {
            window.addEventListener(events[i], function (e) {
                e.stopPropagation();
            },false);
        }
        Show();
        socket = UIU.start();
        socket.onopen = () => {
            connected = true;
            console.log('connected to bot server');
        };
        socket.onclose = () => {
            connected = false;
            console.log('disconnected from bot server');
        };

        var inputs: JQuery = $('#editor');
        var timer;
        inputs.focus((e) => {
            if (timer) {
                clearTimeout(timer);
                timer = null;
            }
            cuAPI.RequestInputOwnership();
        });
        inputs.blur((e: JQueryEventObject) => {
            // release input ownership after a short delay, it will be cancelled if we
            // are loosing focus because we are placing focus in another field.  Otherwise
            // the release input ownership causes some focus weirdness
            timer = setTimeout(() => { cuAPI.ReleaseInputOwnership(); }, 100);
        });

    };

    function run() {
        var timeout;
        var KQ = 16, FORWARDS = 17, KE = 18, KR = 19, KT = 20, KY = 21,
            STRAFE_LEFT = 30, BACKWARDS = 31, STRAFE_RIGHT = 32;
        var A1 = 2, A2 = 3, A3 = 4, A4 = 5, A5 = 6, A6 = 7, A7 = 8, A8 = 9, A9 = 10, A0 = 11, Am = 12, Ae = 13;
        var cmds = [];
        var runcmd = function (o) {
            if (STOP) {
                cmds = [];
                console.log('BOT aborted');
                // if (o.done) o.done();
                return;
            }
            var cmd = cmds.shift(),
                next = function () {
                    if (cmds.length) {
                        setTimeout(function () { runcmd(o); }, 0);
                    } else {
                        console.log('BOT run out of commands');
                        if (o.done) o.done();
                    }
                };
            document.getElementById("trash").focus();
            switch (cmd[0]) {
            case "sleep":
                console.log('BOT sleep ' + cmd[1][0]);
                setTimeout(() => next(), cmd[1][0] * 1000);
                break;
            case "health":
                if (o.health) {
                    console.log('BOT health ' + cuAPI.characterName + " hp " + cuAPI.hp + "/" + cuAPI.maxHP + " effects " + cuAPI.selfEffects);
                    o.health(cuAPI.characterName, cuAPI.hp, cuAPI.maxHP, cuAPI.selfEffects);
                }
                next();
                break;
            case "target":
                if (o.target) {
                    console.log('BOT ' + (cuAPI.isTargetFriendly ? 'friendly ' : '') + 'target ' + cuAPI.targetName + " hp " + cuAPI.targetHP + "/" + cuAPI.maxHP + " effects " + cuAPI.targetEffects);
                    o.target(cuAPI.isTargetFriendly, cuAPI.targetName, cuAPI.targetHP, cuAPI.maxHP, cuAPI.targetEffects);
                }
                next();
                break;
            case "loc":
                if (o.loc) {
                    var x = cuAPI.locationX, y = cuAPI.locationY, z = cuAPI.locationZ;
                    console.log("LOC " + x + "," + y + "," + z);
                    o.loc(x, y, z);
                }
                next();
                break;
            case "check":
                if (o.check) {
                    o.check(cuAPI);
                }
                next();
                break;
            case "move":
                console.log('BOT ' + cmd[0] + ' ' + JSON.stringify(cmd[1]));
                socket.command("keypress", cmd[1]);
                if (o.moving) {
                    if (timeout) {
                        console.log('CLEAR timeout ' + timeout);
                        clearTimeout(timeout);
                    }
                    timeout = setTimeout(() => {
                        o.moving();
                    }, 1000);
                    console.log('NEW timeout ' + timeout);
                }
                socket.onmessage = (message) => {
                    if (timeout) clearTimeout(timeout);
                    timeout = null;
                    next();
                };
                break;
            case "attack":
                console.log('BOT ' + cmd[0] + ' ' + JSON.stringify(cmd[1]));
                socket.command("keypress", cmd[1]);
                if (o.attacking) {
                    if (timeout) {
                        console.log('CLEAR timeout ' + timeout);
                        clearTimeout(timeout);
                    }
                    timeout = setTimeout(() => {
                        o.attacking();
                    }, 1000);
                    console.log('NEW timeout ' + timeout);
                }
                socket.onmessage = (message) => {
                    timeout = null;
                    next();
                };
                break;
            default:
                console.log('BOT ' + cmd[0] + ' ' + JSON.stringify(cmd[1]));
                socket.command(cmd[0], cmd[1]);
                socket.onmessage = (message) => next();
                break;
            }
        };
        var cancel = function () {
            socket.command("cancel");
        };
        var BOT = {
            reset: function () {
                console.log('BOT reset');
                cmds = [];
                return BOT;
            },
            cancel: function () {
                cancel();
                return BOT;
            },
            key: function (k, duration) {
                cmds.push(["keypress", [k, ((duration || 0.1) * 1000) | 0]]);
                return BOT;
            },
            walk: function (direction, duration) {
                if (connected) {
                    cmds.push(["move", [direction, ((duration || 1) * 1000) | 0]]);
                }
                return BOT;
            },
            jump: function (duration) {
                if (connected) {
                    cmds.push(["keypress", [57, ((duration || 0.1) * 1000) | 0]]);
                }
                return BOT;
            },
            turn: function (amount, step, delay) {
                if (connected) {
                    amount = (amount | 0) || 200;
                    step = (step | 0) || 10;
                    delay = (delay | 0) || 10;
                    cmds.push(["turn", [amount, step, delay]]);
                }
                return BOT;
            },
            click: function (delay, x, y) {
                if (connected) {
                    delay = (delay | 0) || 10;
                    cmds.push(["click", [delay]]);
                }
                return BOT;
            },
            attack: function (skill, delay) {
                if (connected) {
                    cmds.push(["attack", [skill, ((delay||1)*1000)|0]]);
                }
                return BOT;
            },
            sleep: function (duration) {
                cmds.push(["sleep", [duration]]);
                return BOT;
            },
            nextTarget: function () {
                if (connected) {
                    cmds.push(["keypress", [15]]);
                }
                return BOT;
            },
            health: function () {
                cmds.push(["health"]);
                return BOT;
            },
            target: function () {
                cmds.push(["target"]);
                return BOT;
            },
            loc: function () {
                cmds.push(["loc"]);
                return BOT;
            },
            start: function (o) {
                if (cmds.length) {
                    setTimeout(function () { runcmd(o); }, 0);
                }
                return BOT;
            }
        };
        var s = ml.text();
         try {
            STOP = false;
            eval(s);
         } catch (e) {
            alert(e.message + '\n' + e.stack);
        }
    };

    // Show the addons UI
    function Show() {
        document.body.style.display = 'block';
    };

    // Hide the addons UI
    function Hide() {
        document.body.style.display = 'none';
    }

    // Initialise
    _init();
};
