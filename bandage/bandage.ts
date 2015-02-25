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
            $bandage.empty();

            var button = ability.MakeButton(0);

            var elem = button.rootElement;

            if (ability.name) elem.attr('data-tooltip-title', ability.name);

            if (ability.tooltip) elem.attr('data-tooltip-content', ability.tooltip);

            $bandage.append(elem);

            var tooltip = new Tooltip(elem, { leftOffset: 0, topOffset: -30 });
        }, true);
    });
}