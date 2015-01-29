module Announcer {

    var player: string;
    var selfKills = [];
    var announcements = [], playing;

    var play = function (name) {
        // playing a new sound overrides all but the currently playing sound
        announcements.push({ time: Date.now(), name: name });
        if (!playing) {
            playing = true;
            setTimeout(playAll, 50);
        }
    };

    var playAll = function () {
        // we only play the last sound queue, and then discard the rest
        playing = announcements.pop();
        while (announcements.shift());      // drain announcement queue
        console.log(playing.name);
        var audio = new Audio(playing.name);
        audio.onended = function () {
            if (announcements.length) {
                setTimeout(playAll, 50);
            } else {
                playing = null;
            }
        };
        audio.play();
    };

    function Announce(who) {
        if (who[1] === player) {
            selfKills = [];
            play("WilhelmScream.ogg");
        } else if (who[0] === player) {
            selfKills.push(Date.now());
            if (selfKills.length > 1) {
                var last = selfKills[selfKills.length - 1], count = 1;
                for (var i = selfKills.length - 2; i >= 0; i--) {
                    if (last - selfKills[i] > count * 1000) {
                        // too slow
                        break;
                    }
                    count++;
                }
                if (count > 1) {
                    switch (selfKills.length) {
                        case 2: play("doublekill.ogg"); break;
                        case 3: play("multikill.ogg"); break;
                        case 4: play("megakill.ogg"); break;
                        case 5: play("ultrakill.ogg"); break;
                        default: play("monsterkill.ogg"); break;
                    }
                    return;
                }
                if (selfKills.length > 2) {
                    switch (selfKills.length) {
                        case 3: play("killingspree.ogg"); break;
                        case 4: play("rampage.ogg"); break;
                        case 5: play("dominating.ogg"); break;
                        case 6: play("unstoppable.ogg"); break;
                        default: play("godlike.ogg"); break;
                    }
                }
            }
        }
    }

    function OnChat(type, from, body, nick, iscse) {
        switch (type) {
        case XmppMessageType.GROUPCHAT:
            var user = from.split("@")[0];
            if (user === "_combat") {
                Announce(body.substr(0,body.length-1).split(" killed "));
            }
            break;
        }
    }

    function init() {
        cuAPI.OnCharacterNameChanged((name: string) => {
            player = name;
        });
        cuAPI.OnChat(OnChat);
        setTimeout(function () { cuAPI.OpenUI("chat.ui"); }, 0);
    }

    // initialise 
    if (typeof cuAPI !== "undefined") {
        cuAPI.CloseUI("chat");
        if (cuAPI.initialized) {  // already initialised
            init();
        } else {
            cuAPI.OnInitialized(init);
        }
    } 

}; 