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
            showPrevButton: false,
            onClose: function () {
                $('.hopscotch-bubble').css({ 'margin-top': '0', 'opacity': '1', 'display': 'none', 'visibility': 'hidden' }).animate({ 'margin-top': '-25px', 'opacity': '0' }, 700);
                cuAPI.Fire("spellbookopen");
            }

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
            content: "Here's your control game interface. On the left you've got a mini map. Up top, you can view the Realms' scores and the time left in the game round.",
            placement: "bottom",
            xOffset: "center",
            yOffset: 50,
            arrowOffset: -9999,
            showPrevButton: false,
            onShow: function () {
                $('.animated').css({ 'margin-top': '-25px', 'opacity': '0' }).animate({ 'margin-top': '0', 'opacity': '1' }, 700);
                $('.overlaytour').css({ 'opacity': '0' }).animate({ 'opacity': '1' }, 600);
            }
        },
        {
            title: "Objectives",
            target: document.querySelector("#tour"),
            content: "Control Points can only be captured if a single faction is within range of the duck. Captured Points turn a different color based on Realm, and contested points will turn orange.",
            placement: "bottom",
            xOffset: "center",
            yOffset: 50,
            arrowOffset: -9999,
            showPrevButton: false,
            onShow: function () {
                $('.animated').css({ 'margin-top': '-25px', 'opacity': '0' }).animate({ 'margin-top': '0', 'opacity': '1' }, 700);
                $('#controlpoint').css({ 'opacity': '0' }).animate({ 'opacity': '1' }, 700);
            }
        },
        {
            title: "Increasing Your Score",
            target: document.querySelector("#tour"),
            content: "A captured control point increases your Realm's score every 5 seconds. Killing a player gives your Realm a chunk of points, as well!",
            placement: "bottom",
            xOffset: "center",
            yOffset: 50,
            arrowOffset: -9999,
            showPrevButton: false
        },
        {
            title: "Are you ready?",
            target: document.querySelector("#tour"),
            content: "If you want to go through the tour again, you can click the “Restart” button below. Remember, the Realm with the highest score at the end of the round wins the admiration of the world, until the next round starts. Good luck, and happy hunting!",
            placement: "bottom",
            xOffset: "center",
            yOffset: 50,
            arrowOffset: -9999,
            showPrevButton: true,
            onNext: function () {
                console.log("END TOUR: Overlay closeeeee");
                $('.overlaytour').css({ 'opacity': '1' }).animate({ 'opacity': '0' }, 600);
            },
            onPrev: function () {
                $('.overlaytour').css({ 'opacity': '1' }).animate({ 'opacity': '0' }, 600);
                hopscotch.showStep(0);
            }
        },
        {
            /* filler/buffer step*/
            target: document.querySelector("#tour"),
            placement: "bottom",
            zindex: -9999,
            onShow: function () {
                $('.hopscotch-bubble').css({ 'margin-top': '-25px', 'opacity': '0' });
            }
        }
    ],
    fixedElement: true,
    showCloseButton: true,
    multipage: true,
    skipIfNoElement: false,
    bubbleWidth: '330',
    i18n: {
        nextBtn: "Okay!",
        prevBtn: "Restart",
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
        if (hopscotch.getCurrStepNum() >= 7){
        $('.overlaytour').css({ 'opacity': '1' }).animate({ 'opacity': '0' }, 600);
    }
        cuAPI.Fire("abilitybuilderopen");
        cuAPI.Fire("spellbookopen");
        endTour = true;
    },
    onStart: function () {
        $('.hopscotch-bubble').css({ 'display': 'block', 'visibility': 'visible' });
    }
};

// Start Tour - change it back hopscotch.startTour(welcome);
hopscotch.startTour(welcome);
cuAPI.Fire("touruistart");

var endTour = false;

//cuAPI.Fire("closeABwindow");
function tourRestartInitialize() {
    cuAPI.Listen("closeABwindow");
    cuAPI.Listen("closeSpellbook");

    cuAPI.OnEvent((event, data) => {
        if (event == "closeABwindow") {
            hopscotch.showStep(3);
            console.log("RESTART: tour");
        } else if (event == "closeSpellbook") {
            if (endTour == true) {
                console.log("endTour true, start tour");
                hopscotch.startTour(welcome, 6);
            } else {
                hopscotch.showStep(6);
            }
            console.log("RESTART: tour from spell book");
        } 
    });
};

cu.OnInitialized(tourRestartInitialize);