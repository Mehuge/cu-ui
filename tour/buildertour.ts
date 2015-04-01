/* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/// <reference path="../vendor/numeral.d.ts" />
/// <reference path="../vendor/jquery.d.ts" />
var buildertour = {
    id: "buildertour",
    steps: [
        {
            title: "Primary Component",
            target: document.querySelector("#network"),
            content: "First, select a Primary component by clicking the empty component slot in the center of the ability builder view, and selecting one of the available components from the list.",
            placement: "top",
            xOffset: 32,
            yOffset: 100,
            arrowOffset: 158
        },
        {
            target: document.querySelector("#network"),
            title: "Secondary Component",
            content: "Select a Secondary component. This defines what the ability does with the Primary component.",
            placement: "top",
            xOffset: 32,
            yOffset: 100,
            arrowOffset: 285
        },
        {
            target: document.querySelector("#btn-select-icon"),
            title: "Select an icon",
            content: "These icons are, like in a spy movie, for your eyes only. Whatever you select will not be seen by other players, and is only for your own UI.",
            placement: "bottom",
            xOffset: -300,
            arrowOffset: 288,
            nextOnTargetClick: true
        },
        {
            /* filler/buffer step*/
            target: document.querySelector("#btn-select-icon"),
            placement: "bottom",
            xOffset: -300,
            width: 1,
            onShow: function () {
                $('.hopscotch-bubble').css({ 'margin-top': '-25px', 'opacity': '0' });
            },
            zindex: -9999
        },
        {
            title: "Name your ability",
            target: document.querySelector("#ability-name-container"),
            content: "Click the field and type a name for your ability. This is required.",
            placement: "bottom",
            xOffset: 30,
            yOffset: -10,
            arrowOffset: "center",
            showNextButton: true,
            nextOnTargetClick: true
        },
        {
            title: "Ability description",
            target: document.querySelector("#ability-notes-container"),
            content: "You can click the field and type a description of the ability to help you remember what it does. This is optional",
            placement: "bottom",
            xOffset: 30,
            yOffset: -10,
            arrowOffset: "center",
            showNextButton: true,
            nextOnTargetClick: true
        },
        {
            title: "Build!",
            target: document.querySelector("#btn-build"),
            content: "Finally, press the Build button to complete your ability. It will automatically be added to your skill bar, as well as to your spellbook, which we're about to take a look at.",
            placement: "top",
            xOffset: -80,
            yOffset: 0,
            arrowOffset: 108,
            nextOnTargetClick: true
        },
        {
            /* filler/buffer step*/
            target: document.querySelector("#btn-build"),
            placement: "bottom",
            zindex: -9999,
            onShow: function () {
                $('.hopscotch-bubble').css({ 'margin-top': '-25px', 'opacity': '0' });
                AbilityBuilder.$builder.fadeOut(() => {
                    cuAPI.Fire("closeABwindow");
                    console.log("FIRE: CLose ab window");
                    if (typeof cuAPI === 'object') {
                        cuAPI.HideUI('ability-builder');
                        setTimeout(() => {
                            AbilityBuilder.$builder.css({ display: 'block' });
                        }, 100);
                    }
                });
            }
        }

    ],
    showNextButton: false,
    showCloseButton: true,
    fixedElement: true,
    multipage: true,
    skipIfNoElement: false,
    bubbleWidth: '330',
    i18n: {
        nextBtn: "Okay!",
        closeTooltip: "x"
    },
    onShow: function () {
        $('.animated').css({ 'margin-top': '-25px', 'opacity': '0' }).animate({ 'margin-top': '0', 'opacity': '1' }, 700);
    },
    onNext: function () {
        $('.hopscotch-bubble').css({ 'margin-top': '-25px', 'opacity': '0' });
    },
    onClose: function () {
        $('.hopscotch-bubble').css({ 'margin-top': '0', 'opacity': '1', 'display': 'none', 'visibility': 'hidden' }).animate({ 'margin-top': '-25px', 'opacity': '0' }, 700);
    }
};



function builderTourInitialize() {
    console.log("1");

    cuAPI.Listen("abilitybuilderopen");
    cuAPI.Listen("primarychosen");
    cuAPI.Listen("secondarychosen");
    cuAPI.Listen("iconselect");

    cuAPI.OnEvent((event, data) => {
        console.log("2 " + event);

        if (event == "abilitybuilderopen") {
            hopscotch.startTour(buildertour, 0);
            console.log("Start tour Buildertour");
        } else if (event == "primarychosen") {
            console.log("Listen: primarychosen");
            hopscotch.showStep(1);
        } else if (event == "secondarychosen") {
            console.log("Listen: secondarychosen");
            hopscotch.showStep(2);
        } else if (event == "iconselect") {
            console.log("Listen: iconselect");
            hopscotch.showStep(4); 
        }
    });
};

cu.OnInitialized(builderTourInitialize);