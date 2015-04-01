/* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/// <reference path="../vendor/numeral.d.ts" />
/// <reference path="../vendor/jquery.d.ts" />
var welcome = {
    id: "welcome",
    steps: [
        {
            title: "Welcome to Camelot Unchained",
            target: document.querySelector("#tour"),
            content: "Everything in Alpha is more than a little rough, but we think that even in its current form, our Alpha game is a lot of fun!",
            placement: "bottom",
            xOffset: "center",
            yOffset: 50,
            arrowOffset: -9999,
            delay: 500,
            showPrevButton: false
        },
        {
            title: "Ability Builder (v)",
            target: document.querySelector("#tour"),
            content: "To create an ability, you need to open the Ability Builder by pressing the “V” key on your keyboard.",
            placement: "bottom",
            xOffset: "center",
            yOffset: 50,
            arrowOffset: -9999,
            showNextButton: false,
            showPrevButton: false

        },
        {
            /* filler/buffer step*/
            target: document.querySelector("#tour"),
            placement: "bottom",
            zindex: -9999,
            onShow: function () {
                $('.hopscotch-bubble').css({ 'margin-top': '-25px', 'opacity': '0' });
            }
        },
        {
            title: "Great!",
            target: document.querySelector("#tour"),
            content: "Now that you have you learned how to make basic abilities, let’s take a quick look at your Big Book of Spells and Abilities. ",
            placement: "bottom",
            xOffset: "center",
            yOffset: 50,
            arrowOffset: -9999,
            delay: 500,
            showPrevButton: false
        },
        {
            title: "Spellbook (b)",
            target: document.querySelector("#tour"),
            content: "Now open your spellbook by pressing the “b” key on your keyboard.",
            placement: "bottom",
            xOffset: "center",
            yOffset: 50,
            arrowOffset: -9999,
            showNextButton: false,
            showPrevButton: false,
            onShow: function () {
                $('.animated').css({ 'margin-top': '-25px', 'opacity': '0' }).animate({ 'margin-top': '0', 'opacity': '1' }, 700);
                $(document).on('keydown', function (e) {
                    if (e.keyCode == 66) {
                        hopscotch.nextStep();
                        $(document).off('keydown');
                        cuAPI.Fire("spellbookopen");
                        console.log("FIRE: Spellbook OPEN");
                    }
                });
            },

        },
        {
            /* filler/buffer step*/
            target: document.querySelector("#tour"),
            placement: "bottom",
            zindex: -9999,
            onShow: function () {
                $('.hopscotch-bubble').css({ 'margin-top': '-25px', 'opacity': '0' });
            }
        },
        { 
            title: "That's it for abilities!",
            target: document.querySelector("#tour"),
            content: "Now that you know how to build and view your abilities, let's take a look at how our control game currently works. ",
            placement: "bottom",
            xOffset: "center",
            yOffset: 50,
            arrowOffset: -9999,
            delay: 500,
            showPrevButton: false
        },
        {
            title: "Control Game Interface",
            target: document.querySelector("#tour"),
            content: "this is are your control game interface. You have a mini map. track your realm points and time left. change text",
            placement: "bottom",
            xOffset: "center",
            yOffset: 50,
            arrowOffset: -9999,
            showPrevButton: false,
            onShow: function () {
                $('.animated').css({ 'margin-top': '-25px', 'opacity': '0' }).animate({ 'margin-top': '0', 'opacity': '1' }, 700);
                $('.overlaytour').css({ 'opacity': '0' }).animate({'opacity': '1' }, 500);
            }
        },
        {
            title: "How to play",
            target: document.querySelector("#tour"),
            content: "Control points can only be captured if a single faction is within range of the duck.  Multiple factions nearby prevent capture of a point.",
            placement: "bottom",
            xOffset: "center",
            yOffset: 50,
            arrowOffset: -9999,
            showPrevButton: false,
            onShow: function () {
                $('.animated').css({ 'margin-top': '-25px', 'opacity': '0' }).animate({ 'margin-top': '0', 'opacity': '1' }, 700);
                $('#controlpoint').css({ 'opacity': '0' }).animate({ 'opacity': '1' }, 700);
            }
        }

    ],
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
        $(document).on('keydown', function (e) {
            if (e.keyCode == 86) {
                hopscotch.showStep(2);
                $(document).off('keydown');
                console.log("V end tour");
                cuAPI.Fire("abilitybuilderopen");
            }
        });
    },
    onNext: function () {
        $('.hopscotch-bubble').css({ 'margin-top': '-25px', 'opacity': '0' });
    },
    onClose: function () {
        $('.hopscotch-bubble').css({ 'margin-top': '0', 'opacity': '1', 'display': 'none', 'visibility': 'hidden' }).animate({ 'margin-top': '-25px', 'opacity': '0' }, 700);
    }
};

// Start Tour - change it backhopscotch.startTour(welcome);
hopscotch.startTour(welcome, 6);

//cuAPI.Fire("closeABwindow");
function tourRestartInitialize() {
    cuAPI.Listen("closeABwindow");
    cuAPI.Listen("closeSpellbook");

    cuAPI.OnEvent((event, data) => {
        if (event == "closeABwindow") {
            hopscotch.showStep(3);
            console.log("RESTART: tour");
        } else if (event == "closeSpellbook") {
            hopscotch.showStep(6);
            console.log("RESTART: tour from spell book");
        }
    });
};

cu.OnInitialized(tourRestartInitialize);