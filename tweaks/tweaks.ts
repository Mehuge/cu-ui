/// <reference path="../cu/cu.ts" />
/// <reference path="../vendor/jquery.d.ts" />
module Tweaks {
    var INTEGER = 0, BOOLEAN = 1, FLOAT = 2, LIST = 3;
    var tweaks : any = [
        {
            id: "daytime", dflt: true, type: INTEGER, min: -1, max: 24,
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
            id: "invertMouseX", dflt: false, type: BOOLEAN,
            label: "Invert Mouse X"
        },
        {
            id: "invertMouseY", dflt: false, type: BOOLEAN,
            label: "Invert Mouse Y"
        },
        {
            id: "nameplates", dflt: true, type: BOOLEAN,
            label: "Nameplates Enabled"
        },
        {
            id: "NameplateHeight", dflt: 2.3, type: FLOAT, min: -5, max: 5, step: .1,
            label: "Nameplates Height"
        },
        {
            id: "NameplateTotalFadeDistance", dflt: "15", type: INTEGER, min: 0, max: 20, step: 1,
            label: "Total Nameplate Fade Distance"
        },
        {
            id: "NameplateFadeStartDistance", dflt: "40", type: INTEGER, min: 0, max: 999, step: 1,
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
            id: "MaxLightCount", dflt: "2048", type: INTEGER, min: 0, max: 4096, step: 64,
            label: "Max Light Count"
        },
        {
            id: "LOD1Distance", dflt: "1600", type: INTEGER, min: 0, max: 200000, step: 100,
            label: "Level of Detail 1 Distance"
        },
        {
            id: "LOD1Distance", dflt: "20000", type: INTEGER, min: 0, max: 200000, step: 100,
            label: "Level of Detail 2 Distance"
        },
        {
            id: "JumpVelocity", dflt: "5.5", type: FLOAT, min: 0, max: 128, step: 0.5,
            label: "Jump Velocity"
        },
        {
            id: "playerForwardMotion", dflt: "1", type: FLOAT, min: 0, max: 1, step: 0.1,
            label: "Forwards Movement Speed"
        },
        {
            id: "playerBackMotion", dflt: "0.5", type: FLOAT, min: 0, max: 1, step: 0.1,
            label: "Backwards Movement Speed"
        },
        {
            id: "ShowSelf", dflt: true, type: BOOLEAN,
            label: "Show Self"
        },
        {
            id: "debugBoneModelScale", dflt: "3", type: INTEGER, min: 0, max: 32, step: 1,
            label: "Debug Bone Model Scale"
        },
        {
            type: LIST,
            label: "Particle Effect 1 (Fire)",
            id: "debugBoneParticleId 7633175032960017022; renderDebugBonesAsParticles 1; showSelf 0; showSelf 1;"
        },
        {
            type: LIST,
            label: "Particle Effect 2 (Elite Starmap)",
            id: "debugBoneParticleId 4354433766253396831; renderDebugBonesAsParticles 1; showSelf 0; showSelf 1;"
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
                case INTEGER: case FLOAT:
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
                case LIST:
                    slider.attr({ type: "button", value: "Activate" });
                    break;
            }
            slider.appendTo(div);
            div.append('<span>' + tweaks[i].label + '</span>');
            div.appendTo(container);
            ((tweak, div, slider) => {
                if (tweak.type == LIST) {
                    slider.on("click", (e: any) => {
                        var run = function (cmds, i) {
                            if (i < cmds.length) {
                                if (cu.HasAPI()) {
                                    cu.ConsoleCommand(cmds[i]);
                                } else {
                                    console.log(cmds[i]);
                                }
                                setTimeout(function () { run(cmds, ++i); }, 100);
                            }
                        };
                        run(tweak.id.split(";"), 0);
                    });
                } else {
                    div.on("change", (e: any) => {
                        var value = tweak.type == BOOLEAN ? e.target.checked : e.target.value;
                        var cmd = tweak.id + " " + value;
                        if (cu.HasAPI()) {
                            cu.ConsoleCommand(cmd);
                        } else {
                            console.log(cmd);
                        }
                    });
                }
            })(tweak, div, slider);
        }
    }

    // Call paint when we when UI is ready.
    cu.OnInitialized(() => paint());
} 