module Announcer {

    var player: string;
    var selfKills = [];

    function Announce(who) {
        if (who[1] === player) {
            selfKills = [];
            (new Audio("WilhelmScream.ogg")).play();
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
                console.log(JSON.stringify(selfKills));
                if (count > 1) {
                    switch (selfKills.length) {
                        case 2: (new Audio("doublekill.ogg")).play(); break;
                        case 3: (new Audio("multikill.ogg")).play(); break;
                        case 4: (new Audio("megakill.ogg")).play(); break;
                        case 5: (new Audio("ultrakill.ogg")).play(); break;
                        default: (new Audio("monsterkill.ogg")).play(); break;
                    }
                    return;
                }
                if (selfKills.length > 2) {
                    switch (selfKills.length) {
                        case 3: (new Audio("killingspree.ogg")).play(); break;
                        case 4: (new Audio("rampage.ogg")).play(); break;
                        case 5: (new Audio("dominating.ogg")).play(); break;
                        case 6: (new Audio("unstoppable.ogg")).play(); break;
                        default: (new Audio("godlike.ogg")).play(); break;
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