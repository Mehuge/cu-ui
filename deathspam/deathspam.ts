module Deathspam {

    var deathspam, maxHeight, player;

    export function DeathSpam(text) {
        var a = text.split(" killed ");
        var div = document.createElement("div");
        div.className = 'other';
        if (a[0] === player) div.className = 'killer';
        if (a[1].substr(0, a[1].length - 1) === player) div.className = 'killed';
        div.className += " shadow";
        div.textContent = text;
        deathspam.appendChild(div);
        if (deathspam.offsetHeight > maxHeight) {
            var remove = deathspam.children[0];
            if (remove._fadeOutTimer) {
                clearTimeout(remove._fadeOutTimer);
                remove._fadeOutTimer = null;
            }
            deathspam.removeChild(remove);
        }
        (function (fade) {
            function fadeOut() {
                if (fade._fadeOutTimer) {
                    var op = +(fade.style.opacity || 1.0);
                    fade.className = fade.className.replace(" shadow", "");
                    if (((op*10)|0) > 1) {                  // crude way to round to 1 decimal place
                        fade.style.opacity = op - 0.025;
                        fade._fadeOutTimer = setTimeout(fadeOut, 100);
                    } else {
                        deathspam.removeChild(fade);
                    }
                }
            }
            fade._fadeOutTimer = setTimeout(fadeOut, 30000);
        })(div);
    }

    function OnChat(type, from, body, nick, iscse) {
        switch (type) {
            case XmppMessageType.GROUPCHAT:
                var user = from.split("@")[0];
                if (user === "_combat") {
                    DeathSpam(body);
                }
                break;
        }
    }

    function init() {
        cuAPI.OnCharacterNameChanged((name: string) => {
            player = name;
        });
        cuAPI.OnChat(OnChat);
        deathspam = document.getElementById("deathspam");
        maxHeight = window.innerHeight;
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