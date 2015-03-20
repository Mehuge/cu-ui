module Announcer {

    var player: string;
    var selfKills : any = [];
    var announcements : any = [], playing : any;
    var debug : any;
    var multikillGap : number = 2000;

    var play = function (name : string) {
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

    export function Announce(who:string[]) {
        if (who[1] === player) {
            // console.log("ANNOUNCE: suicide @ " + Date.now());
            selfKills = [];
            play("WilhelmScream.ogg");
        } else if (who[0] === player) {
            // console.log("ANNOUNCE: killed " + who[1] + " @ " + Date.now());
            selfKills.push(Date.now());
            if (selfKills.length > 1) {
                var last = selfKills[selfKills.length - 1], count = 1;
                for (var i = selfKills.length - 2; i >= 0; i--) {
                    // console.log("KILLSPAM[" + i + "] at " + selfKills[i] + " COUNT " + count + " DIFF " + (last - selfKills[i]) + " MAX " + (count * 1000));
                    if (last - selfKills[i] > count * multikillGap) {
                        // too slow
                        break;
                    }
                    count++;
                }
                console.log("MULTIKILL COUNT " + count);
                if (count > 1) {
                    debug.innerText = 'MULTIKILL: ' + count;
                    switch (count) {
                        case 2: play("doublekill.ogg"); break;
                        case 3: play("multikill.ogg"); break;
                        case 4: play("megakill.ogg"); break;
                        case 5: play("ultrakill.ogg"); break;
                        default: play("monsterkill.ogg"); break;
                    }
                    return;
                }
                if (selfKills.length > 2) {
                    debug.innerText = 'KILLSTREAK: ' + selfKills.length;
                    switch (selfKills.length) {
                        case 3: play("killingspree.ogg"); break;
                        case 4: play("dominating.ogg"); break;
                        case 5: play("rampage.ogg"); break;
                        case 6: play("unstoppable.ogg"); break;
                        default: play("godlike.ogg"); break;
                    }
                }
            }
        }
    }

    function OnChat(type: number, from: string, body: string, nick: string, iscse: boolean) {
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
        debug = document.getElementById("debug");

        MehugeEvents.sub("slash-scream", (topic: string, ...data: any[]) => {
            play("WilhelmScream.ogg");
        });
        MehugeEvents.pub("chat-register-slash", "scream");
    }

    // initialise 
    if (typeof cuAPI !== "undefined") {
        if (cuAPI.initialized) {  // already initialised
            init();
        } else {
            cuAPI.OnInitialized(init);
        }
    } 

}; 