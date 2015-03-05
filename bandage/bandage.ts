 /* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/// <reference path="../vendor/jquery.d.ts" />

module Bandage {
    /* Constants */

    var BANDAGE_ABILITY_ID = (31).toString(16);

    /* jQuery Elements */

    var $bandage = $('#bandage');

    /* Functions */

    cu.OnInitialized(() => {
        cu.RequestAbility(BANDAGE_ABILITY_ID, ability => {
            ability.icon = '../images/skills/bandage.png';

            var button = ability.MakeButton(0);

            $bandage.empty().append(button.rootElement);

            var tooltip = new Tooltip(button.rootElement, { title: ability.name, content: ability.tooltip, leftOffset: 0, topOffset: -30 });
        }, true);
    });
}