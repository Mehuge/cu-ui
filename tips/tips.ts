/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/// <reference path="../vendor/jquery.d.ts" />

module Tips {
    var $tips = cu.FindElement('#tips');
    var $closeButton = $('#btn-close');
    var $keepOpenButton = $('#btn-keepOpen');
    var $timer = $('#timer');
    var keep_open = false;
    var intervalID;
    var counter = 5;



    $closeButton.click(function () {
        //Audio - play generic select sound here. Close button was clicked. 
        cuAPI.PlaySoundEvent(cu.SOUND_EVENTS.PLAY_UI_MENU_GENERICSELECT);

        close_tips();
    });

    $keepOpenButton.click(function () {
        //Audio - play generic select sound here. KeepOpen button was clicked. 
        cuAPI.PlaySoundEvent(cu.SOUND_EVENTS.PLAY_UI_MENU_GENERICSELECT);

        keep_open = true;
        clearInterval(intervalID);
        $timer.text("");
        
    });


    function close_tips() {
        //cuAPI.HideUI('tip');
        cuAPI.CloseUI('tips');
        $tips.fadeOut();
        keep_open = true;

    }

    // START
    if (cu.HasAPI()) {
        intervalID = setInterval(function () {
            $timer.text("Closing in: " + counter);
            counter = counter - 1;
            if (counter < -1) {
                if (keep_open == false) {
                    close_tips();
                    clearInterval(intervalID);
                }
            }
        }, 1000);
    }

    //$(".tips").draggable();
}
