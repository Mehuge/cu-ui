/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module Building {
    var $buildingButton = $('#building-button');

    $buildingButton.click(() => {
        cu.ChangeBuildingMode();
    });
    cu.Listen('HandleBuildingModeChanged', buildingMode => {
        if (buildingMode) {
            $buildingButton.append($('<img/>').addClass('button-active').attr('src', '../images/skillbar/active-frame.gif'));
        } else {
            $buildingButton.find('.button-active').remove();
        }
    });
}