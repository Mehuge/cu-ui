/* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at http://mozilla.org/MPL/2.0/. */
/// <reference path="../vendor/numeral.d.ts" />
/// <reference path="../vendor/jquery.d.ts" />
// Define the tour!
var tour = {
    id: "character-tour",
    steps: [
        {
            title: "Create a New Character",
            target: document.querySelector("#btn-create-new"),
            content: "Welcome! Click “Create New” to create a new character",
            placement: "top",
            nextOnTargetClick: true,
            fixedElement: true,
            xOffset: -50,
            arrowOffset: "center",
            zindex: -9999
        },
        {
            /* filler/buffer step*/
            target: document.querySelector("#choose-faction"),
            placement: "bottom",
            zindex: -9999
        },
        {
            title: "Realm Selection",
            target: document.querySelector("#choose-faction"),
            content: "Choose a Realm by clicking on one of the three shields. Mouseover the three Realm shields to read descriptions.",
            placement: "top",
            yOffset: 180,
            xOffset: "center",
            arrowOffset: -99999,
            nextOnTargetClick: true
        },
        {
            title: "Choose your race",
            target: document.querySelector("#races"),
            content: "Each race has a pre-selected Archetype.  Archetypes are for testing purposes only, they are NOT intended to be classes.",
            placement: "bottom",
            arrowOffset: 53,
            nextOnTargetClick: true
        },
        {
            title: "Name your character",
            target: document.querySelector("#character-name"),
            content: "Choose a Realm by clicking on one of the three shields. Mouseover the three Realm shields to read descriptions.",
            placement: "bottom",
            arrowOffset: "center",
            nextOnTargetClick: true
        },
        {
            title: "Next step",
            target: document.querySelector("#btn-next"),
            content: "Click “Next” to move to the next step",
            delay: 500,
            placement: "top"
        },
        {
            title: "Attributes",
            target: document.querySelector("#character-top-frame"),
            content: "These are your attributes.  You have 20 available points, all of which must be spent.  <BR><BR><B>Note:</B> These do not yet have any effect in-game.",
            placement: "bottom",
            arrowOffset: 50,
            showNextButton: true
        },
        {
            title: "Using points",
            target: document.querySelector("#choose-attributes"),
            content: "Click the plus or minus sign to add or remove a point for an attribute.",
            placement: "bottom",
            yOffset: -385,
            xOffset: 75,
            arrowOffset: 250,
            nextOnTargetClick: true
        },
        {
            title: "Next step",
            target: document.querySelector("#character-next"),
            content: "You may click “Next” to proceed, once you have allocated all 20 attribute points.",
            delay: 500,
            placement: "top"
        },
        {
            title: "Banes and Boons",
            target: document.querySelector("#character-top-frame"),
            content: "Choose some Banes and Boons. You must spend between 5 and 20 points each on Banes and Boons, and the points spent must be equal. The blue and red bar indicates the balance of points you've spent on each side. <BR><BR><B>Note:</B> Banes and Boons do not yet have any effect in-game.",
            placement: "bottom",
            arrowOffset: 50,
            showNextButton: true
        },
        {
            target: document.querySelector("#choose-boons-and-banes"),
            placement: "top",
            zindex: -9999,
            nextOnTargetClick: true
        },
        {
            title: "All done!",
            target: document.querySelector("#character-complete"),
            content: "Once you have completed all the previous steps correctly, you may click “Complete” to create your character and enter the game. Congratulations, and have fun!",
            placement: "top",
            delay: 500,
            showNextButton: true
        },
        {
            /* filler/buffer step*/
            target: document.querySelector("#choose-faction"),
            placement: "bottom",
            zindex: -9999
        }

    ],
    showNextButton: false,
    showPrevButton: false,
    showCloseButton: false,
    multipage: true,
    skipIfNoElement: false,
    delay: 300,
    i18n: {
        nextBtn: "Okay",
        closeTooltip: "x"
    },
    onShow: function () {
        $('.animated').css({ 'margin-top': '-25px', 'opacity': '0' }).animate({ 'margin-top': '0', 'opacity': '1' }, 700);
    },
    onNext: function () {
        $('.hopscotch-bubble').css({ 'margin-top': '-25px', 'opacity': '0' });
    },
    onClose: function () {
        $('.hopscotch-bubble').css({ 'display': 'none', 'visibility': 'hidden' });
    }
};

