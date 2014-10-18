/// <reference path="../cu/cu.ts" />
/// <reference path="../vendor/jquery.d.ts" />
module Tweaks {
    var INTEGER = 0;
    var tweaks = [
        { id: "NameplateTotalFadeDistance", dflt: "15", type: INTEGER, label: "Total Nameplate Fade Distance", min: 0, max: 99, step: 1, slider: null },
        { id: "NameplateFadeStartDistance", dflt: "40", type: INTEGER, label: "Nameplate Fade Start Distance", min: 0, max: 99, step: 1, slider: null },
    ];
    var container: JQuery = $('#tweaks');
    $('#close').on("click", () => {
        cuAPI.CloseUI("tweaks");
    });

    function paint() {
        for (var i = 0; i < tweaks.length; i++) {
            var tweak = tweaks[i],
                div: JQuery = $('<div>'),
                slider: JQuery = tweak.slider = $('<input>');
            slider.attr({
                type: "range",
                min: tweak.min,
                max: tweak.max,
                step: tweak.step,
                value: tweak.dflt
            });
            slider.appendTo(div);
            div.append('<span>' + tweaks[i].label + '</span>');
            div.appendTo(container);
            ((tweak) => {
                div.on("change", (e: any) => {
                    var cmd = tweak.id + " " + e.target.value;
                    if (cu.HasAPI()) {
                        cu.ConsoleCommand(cmd);
                    } else {
                        console.log(cmd);
                    }
                });
            })(tweak);
        }
    }

    // Call paint when we when UI is ready.
    cu.OnInitialized(() => paint());
} 