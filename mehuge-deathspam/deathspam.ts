module Deathspam {

    var deathspam : HTMLElement, maxHeight : number, player : string;

    export function DeathSpam(text:string) {
        var a = text.split(" killed ");
        a[1] = a[1].substr(0, a[1].length - 1);
        var div = document.createElement("div");

        if (a[1] === player && a[0] === player) {
            div.className = 'suicide';
            text = 'You killed yourself! lololol';
        } else if (a[1] === a[0]) {
            div.className = 'suicide other';
            text = a[0] + ' committed suicide! rofl';
        } else if (a[0] === player) {
            div.className = 'killer';
            a[0] = 'You'
            text = a[0] + ' killed ' + a[1] + '.';
        } else if (a[1] === player) {
            div.className = 'killed';
            a[1] = 'you'
            text = a[0] + ' killed ' + a[1] + '.';
        } else {
            div.className = 'other';
        }
        div.className += " shadow";
        div.textContent = text;
        deathspam.appendChild(div);
        var h : number = deathspam.offsetHeight;
        while (h > maxHeight) {
            var remove: any = deathspam.children[0];
            if (remove._fadeOutTimer) {
                clearTimeout(remove._fadeOutTimer);
                remove._fadeOutTimer = null;
            }
            h -= remove.offsetHeight;
            deathspam.removeChild(remove);
        }
        (function (fade:any) {
            function fadeOut() {
                if (fade._fadeOutTimer) {
                    var op = +(fade.style.opacity || 1.0);
                    fade.className = fade.className.replace(" shadow", "");
                    // console.log('Opacity : ' + op + ' x10 > 1 ' + (((op * 10) | 0) > 1));
                    if (((op*10)|0) > 1) {                  // crude way to round to 1 decimal place
                        fade.style.opacity = op - 0.025;
                        fade._fadeOutTimer = setTimeout(fadeOut, 100);
                    } else {
                        fade.style.opacity = 0;
                    }
                }
            }
            fade._fadeOutTimer = setTimeout(fadeOut, 30000);
        })(div);
    }

    function OnChat(type: number, from: string, body: string, nick: string, iscse: boolean) {
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