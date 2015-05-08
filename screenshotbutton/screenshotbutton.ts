/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module ScreenshotButton {
    var $screenshotButton = $('#screenshot-button');

    $screenshotButton.click(() => {
        cu.OpenScreenshotShare();

        if (!$screenshotButton.find('.button-active').length) {
            $screenshotButton.append($('<img/>').addClass('button-active').attr('src', '../images/skillbar/active-frame.gif'));
            setTimeout(() => {
                $screenshotButton.find('.button-active').remove();
            }, 1000);
        }
    });
}