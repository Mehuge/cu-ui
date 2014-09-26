/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/// <reference path="../vendor/jquery.d.ts" />
/// <reference path="../cu/cu.ts" />

module Skillbar {
    var $skillButtons: JQuery;

    var currentAbilities: string[];

    // Function for sorting abilities by server order.
    function SortByServerOrder(a, b) {
        var aLoc = cuAPI.abilityNumbers.indexOf(a.id);
        var bLoc = cuAPI.abilityNumbers.indexOf(b.id);
        return aLoc - bLoc;
    }

    function UpdateBar() {
        if (_.isEqual(currentAbilities, cuAPI.abilityNumbers)) return;

        currentAbilities = cuAPI.abilityNumbers;

        cu.RequestAllAbilities(abilities => {
            abilities.sort(SortByServerOrder);

            $skillButtons.empty();

            abilities.forEach((ability, i) => {
                var button = ability.MakeButton();

                var elem = button.rootElement.css({ left: (i * 54) + 'px', top: '0' });

                if (ability.name) elem.attr('data-tooltip-title', ability.name);

                if (ability.tooltip) elem.attr('data-tooltip-content', ability.tooltip);

                $skillButtons.append(elem);
            });

            new Tooltip($skillButtons.children(), { leftOffset: -5, topOffset: -25 });
        });
    }

    cu.OnServerConnected(() => {
        $skillButtons = cu.FindElement('#skillButtons');
    });

    cu.SetDebugServer();

    // How often we call Update
    var updateFPS = .5;
    cu.RunAtInterval(UpdateBar, updateFPS);
}