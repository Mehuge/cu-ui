/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/// <reference path="../vendor/jquery.d.ts" />

module Injuries {
    var $injuryLocation = cu.FindElement('#injury-location');
    var $injuryBar = cu.FindElement('#injury-bar');
    var injuryBarWidth = $injuryBar.width();
    var $injuryText = cu.FindElement('#injury-text');
    var $injuryCount = cu.FindElement('#injury-count');

    // #TODO: add body part enumeration for part parameter.
    function updateInjury(part: number, health: number, maxHealth: number, numWounds: number) {
        if (maxHealth > 0) {
            $injuryLocation.text("Torso");
            var healthRatio = health / maxHealth;
            $injuryBar.width(healthRatio * injuryBarWidth);
            $injuryText.text(health + ' / ' + maxHealth);
            $injuryCount.text(numWounds);
        } else {
            $injuryLocation.text('');
            $injuryBar.width(0);
            $injuryText.text('');
            $injuryCount.text('');
        }
    }

    if (cu.HasAPI()) {
        cu.OnInitialized(() => {
            cuAPI.OnCharacterInjuriesChanged(updateInjury);
        });
    }
}