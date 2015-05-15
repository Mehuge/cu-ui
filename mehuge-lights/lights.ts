module Lights {
    var settings: any = {
        intensity: 2,
        radius: 50,
        red: 255,
        green: 255,
        blue: 255
    };

    function update() {
        color.style.backgroundColor = 'rgb(' + settings.red + ',' + settings.green + ',' + settings.blue + ')';
    }
    function changed(e) {
        settings[e.target.id] = e.target.value | 0;
        update();
    }
    function focus(e) {
        setTimeout(function () {
            cuAPI.RequestInputOwnership();
        }, 10);
    }
    function blur(e) {
        cuAPI.ReleaseInputOwnership();
    }
    function E(n) : any {
        return document.getElementById(n);
    }

    var drop = E("drop"), color = E("color"), reset = E("reset");

    for (var n in settings) {
        var el : HTMLInputElement = E(n);
        el.value = settings[n];
        el.onchange = changed;
        el.onfocus = focus;
        el.onblur = blur;
    }
    update();

    if (typeof cuAPI !== "undefined") {
        cuAPI.OnInitialized(() => {
            drop.onclick = function () {
                cuAPI.DropLight(settings.intensity | 0, settings.radius | 0, settings.red | 0, settings.green | 0, settings.blue | 0);
               color.focus();
            };
            reset.onclick = function () {
                cuAPI.ResetLights();
                color.focus();
            };
        });
    }
} 