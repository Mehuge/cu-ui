﻿/// <reference path="../cu/cu.ts" />
/// <reference path="../vendor/jquery.d.ts" />
module Tweaks {
    var INTEGER = 0, BOOLEAN = 1;
    var tweaks : any = [
        {
            id: "daytime", dflt: true, type: INTEGER, min: 0, max: 24,
            label: "Time of Day"
        },
        {
            id: "gpuphysics", dflt: true, type: BOOLEAN,
            label: "GPU Physics"
        },
        {
            id: "vsync", dflt: true, type: BOOLEAN,
            label: "Vertical Sync"
        },
        {
            id: "showServerPosition", dflt: false, type: BOOLEAN,
            label: "Show Server Position"
        },
        {
            id: "fogEnabled", dflt: true, type: BOOLEAN,
            label: "Fog Enabled"
        },
        {
            id: "nameplates", dflt: true, type: BOOLEAN,
            label: "Nameplates Enabled"
        },
        {
            id: "NameplateTotalFadeDistance", dflt: "15", type: INTEGER, min: 0, max: 99, step: 1,
            label: "Total Nameplate Fade Distance"
        },
        {
            id: "NameplateFadeStartDistance", dflt: "40", type: INTEGER, min: 0, max: 99, step: 1,
            label: "Nameplate Fade Start Distance"
        },
        {
            id: "TargetIndicatorHeight", dflt: "3", type: INTEGER, min: 0, max: 99, step: 1,
            label: "Target Indicator Height"
        },
        {
            id: "TargetIndicatorDesiredDistanceToCamera", dflt: "20", type: INTEGER, min: 0, max: 99, step: 1,
            label: "Target Indicator Distance"
        },
        {
            id: "shadowMapCount", dflt: "4", type: INTEGER, min: 0, max: 6, step: 1,
            label: "Shadow Map Count"
        },
        {
            id: "shadowMapRes", dflt: "1024", type: INTEGER, min: 0, max: 2048, step: 32,
            label: "Shadow Map Resolution"
        },
        {
            id: "shadowMaxDist", dflt: "10000", type: INTEGER, min: 0, max: 10000, step: 50,
            label: "Shadow Max Distance"
        },
        {
            id: "MaxLightCount ", dflt: "2048", type: INTEGER, min: 0, max: 4096, step: 64,
            label: "Max Light Count"
        },
    ];
    var container: JQuery = $('#tweaks');
    $('#close').on("click", () => {
        cuAPI.CloseUI("tweaks");
    });

    function paint() {
        for (var i = 0; i < tweaks.length; i++) {
            var tweak = tweaks[i],
                div: JQuery = $('<div>'),
                slider: JQuery = $('<input>');
            switch (tweak.type) {
                case INTEGER:
                    slider.attr({
                        type: "range",
                        min: tweak.min,
                        max: tweak.max,
                        step: tweak.step,
                        value: tweak.dflt
                    });
                    break;
                case BOOLEAN:
                    slider.attr({
                        type: "checkbox",
                        checked: tweak.dflt
                    });
                    break;
            }
            slider.appendTo(div);
            div.append('<span>' + tweaks[i].label + '</span>');
            div.appendTo(container);
            ((tweak) => {
                div.on("change", (e: any) => {
                    var value = tweak.type == BOOLEAN ? e.target.checked : e.target.value;
                    var cmd = tweak.id + " " + value;
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