module Group {
    var connected, hasAPI = typeof cuAPI !== "undefined";
    var players = {};
    var $group: JQuery = $('#group');

    function loc() {
        return hasAPI ? { x: +(cuAPI.locationX.toFixed(2)), y: +(cuAPI.locationY.toFixed(2)), z: +(cuAPI.locationZ.toFixed(2)) } : { x: 0, y: 0, z: 0 };
    }
    function dist(R1: any, R2: any): number {
        var Dx = R2.x - R1.x,
            Dy = R2.y - R1.y,
            Dz = R2.z - R1.z;
        return Math.sqrt((Dx*Dx)+(Dy*Dy)+(Dz*Dz));
    }

    function angle(R1, R2): number {
        // Calculate the angle
        var PI = 3.1415926535;
        var A = Math.atan2(R2.x - R1.x, R2.y - R1.y);
        if (A < 0) A += (2 * PI);
        return (A * 180 / PI) | 0;
    }
    function compass(angle) {
        var c = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW", "N" ];
        var i = ((angle+((360/16)/2)) / (360/16))|0;
        return c[i];
    }

    function paint() {

        // function to render a player unit frame in the group window
        function rend($parent: JQuery, player: any) {
            var c = compass(player.direction);
            var $unit: JQuery = $('<div>').addClass("player").appendTo($parent);
            $('<div>').addClass("name").text(player.name).appendTo($unit);
            var $health: JQuery = $('<div>').addClass("health").appendTo($unit);
            $('<div>').addClass("text").text(player.health > -1 ? player.health + ' / ' + player.max : player.health ? 'respawning' : '...').appendTo($health);
            $('<div>').addClass("dist").text(player.dist + 'm').appendTo($health);
            $('<div>').addClass("compass").text(compass(player.direction)).appendTo($health);
            $('<div>').addClass("bar").css({ backgroundSize: player.health > -1 ? ((player.health / player.max) * 100) + '% 100%' : '0px' }).appendTo($health);
        }

        // Group players by distance
        var aoe = [], near = [], mid = [], far = [], pos = loc(), player, now = Date.now();
        for (var name in players) {
            player = players[name];
            if (!player) continue;
            if (now - player.updated > 60000) {
                players[name] = null;
                continue;
            }
            player.name = name;
            if (player.name === state.c) {
                player.dist = 0;
                player.direction = 0;
            } else {
                player.dist = +(dist(pos, player.loc).toFixed(1));
                player.direction = angle(pos, player.loc);
            }
            if (player.dist <= 5) {
                aoe.push(player);
            } else if (player.dist <= 20) {
                near.push(player);
            } else if (player.dist <= 70) {
                mid.push(player);
            } else {
                far.push(player);
            }
        }

        // render player data
        $group.html("");
        var $d: JQuery = $('<div>').addClass('aoe').appendTo($group)
        for (var i = 0; i < aoe.length; i++) {
            rend($d, aoe[i]);
        }
        $d = $('<div>').addClass('near').appendTo($group)
        for (var i = 0; i < near.length; i++) {
            rend($d, near[i]);
        }
        $d = $('<div>').addClass('mid').appendTo($group)
        for (var i = 0; i < mid.length; i++) {
            rend($d, mid[i]);
        }
        $d = $('<div>').addClass('far').appendTo($group)
        for (var i = 0; i < far.length; i++) {
            rend($d, far[i]);
        }

        // cleanup
        var np = {};
        for (name in players) {
            if (players[name]) np[name] = players[name];
        }
        players = np;
    }

    var state:any = { v: 2 };

    function pulse() {
        var l = loc();
        state.x = l.x;
        state.y = l.y;
        state.z = l.z;
        Mehuge.send(state);
    }

    var token;
    if (typeof cuAPI === "undefined") {
        document.body.style.backgroundColor = 'black';
        token = { username: window.prompt('Username'), password: window.prompt('Password') };
    } else {
        token = cuAPI.loginToken;
    }

    function join() {

        Mehuge.connect(token, Base64.encode("groupui:faction:"+state.f), function () {
            // connected
            connected = true;
            pulse();
            if (typeof cuAPI !== "undefined") {
                setInterval(function () { pulse(); }, 10000);
            }
        });

        Mehuge.listen(function (msg) {
            if (msg.character === "") return;
            var player = players[msg.c||msg.character] || {};
            if ((msg.v | 0) === 2) {
                // new version 2
                player.health = msg.h;
                player.max = msg.m;
                player.loc = { x: msg.x, y: msg.y, z: msg.z };
            }
            player.updated = Date.now();
            players[msg.c||msg.character] = player;
        });
        window.onunload = function () {
            Mehuge.disconnect();
        }
        setInterval(paint, 250);
    }

    if (typeof cuAPI != "undefined") {
        var readyState: number = 0;
        function xmit() {
            readyState++;
            if (connected) {
                pulse();
            } else if (readyState === 4) {
                join();
            }
        }
        cuAPI.OnCharacterNameChanged(function (name) {
            if (name !== "") {
                state.c = name;
                xmit();
            }
        });
        cuAPI.OnCharacterFactionChanged(function (faction) {
            state.f = faction;
            xmit();
        });
        cuAPI.OnCharacterRaceChanged(function (race) {
            state.r = race;
            xmit();
        });
        cuAPI.OnCharacterHealthChanged(function (health, maxHealth) {
            state.h = health;
            state.m = maxHealth;
            xmit();
        });
    }
}
 