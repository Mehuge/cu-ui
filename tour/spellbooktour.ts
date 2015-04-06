/* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/// <reference path="../vendor/numeral.d.ts" />
/// <reference path="../vendor/jquery.d.ts" />
var spellbooktour = {
    id: "spellbooktour",
    steps: [
        {
            title: "Book Tabs",
            target: document.querySelector("#btn-abilities"),
            content: "These tabs take you to different sections of the spellbook.",
            placement: "bottom",
            xOffset: 0,
            yOffset: 0,
            arrowOffset: 30,
            showNextButton: true,
            nextOnTargetClick: true
        },
        {
            target: document.querySelector("#spellbook"),
            title: "Abilities",
            content: "When you first open your spellbook you'll come to this page, which will show you all of your abilities.",
            placement: "bottom",
            xOffset: "center",
            yOffset: -300,
            arrowOffset: -99999,
            showNextButton: true,
            onShow: function () {
                $('.animated').css({ 'margin-top': '-25px', 'opacity': '0' }).animate({ 'margin-top': '0', 'opacity': '1' }, 700);
                Spellbook.$pages.turn('page', 2);
                console.log('PAGE: Abilities page');
            }
        },
        {
            target: document.querySelector("#pages"),
            title: "Turn the page",
            placement: "top",
            xOffset: 530,
            yOffset: 520,
            arrowOffset: 180,
            width: 200,
            nextOnTargetClick: true
        },
        {
            title: "Delete button",
            target: document.querySelector("#spellbook"),
            content: "You can use this button to delete a current ability from your book.",
            placement: "bottom",
            xOffset: 30,
            yOffset: -470,
            arrowOffset: 300,
            showNextButton: true
        },
        {
            title: "Ability Preview",
            target: document.querySelector("#spellbook"),
            content: "Here, you can look at the components used to make this ability",
            placement: "bottom",
            xOffset: 30,
            yOffset: -245,
            arrowOffset: 90,
            showNextButton: true
        },
        {
            title: "Components tab",
            target: document.querySelector("#btn-components"),
            content: "Click to view your components.",
            placement: "bottom",
            xOffset: 0,
            yOffset: 0,
            arrowOffset: 30,
            nextOnTargetClick: true
        },
        {
            title: "Your Components",
            target: document.querySelector("#spellbook"),
            content: "This page shows all the components that are currently available for your character to use.",
            placement: "bottom",
            xOffset: "center",
            yOffset: -300,
            arrowOffset: -99999,
            showNextButton: true
        },
        {
            /* filler/buffer step*/
            target: document.querySelector("#spellbook"),
            placement: "bottom",
            zindex: -9999,
            xOffset: -9999,
            onShow: function () {
                $('.hopscotch-bubble').css({ 'margin-top': '-25px', 'opacity': '0' });
                Spellbook.$spellbook.fadeOut(() => {
                    cuAPI.Fire("closeSpellbook");
                    console.log("FIRE: Close spellbook");
                    if (typeof cuAPI === 'object') {
                        cuAPI.HideUI('spellbook');
                        setTimeout(() => {
                            Spellbook.$spellbook.css({ display: 'block' });
                        }, 100);
                    }
                });

            }
        }
    ],
    showCloseButton: true,
    showNextButton: false,
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
    }
};


function spellBookInitialize() {
    cuAPI.Listen("spellbookopen");
    cuAPI.Listen("touruistart");

    cuAPI.OnEvent((event, data) => {
        if (event == "spellbookopen") {
            hopscotch.startTour(spellbooktour, 0);
            console.log("START: Start tour Spellbook");
        } else if (event == "touruistart") {
            Spellbook.$btnHelp.click(function () {
                cuAPI.Fire("spellbookopen")
            });
        }
    });
};

cu.OnInitialized(spellBookInitialize);
