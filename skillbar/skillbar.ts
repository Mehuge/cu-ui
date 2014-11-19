/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/// <reference path="../vendor/jquery.d.ts" />
/// <reference path="../cu/cu.ts" />

module Skillbar {
    var $skillButtons = cu.FindElement('#skillButtons');

    var BUTTON_WIDTH = 50;
    var BUTTON_LEFT_OFFSET = 5;

    var abilityNumbers: string[] = [];

    // Function for sorting abilities by server order.
    function sortByServerOrder(a, b) {
        if (!abilityNumbers || !abilityNumbers.length) return 0;
        var aLoc = abilityNumbers.indexOf(a.id);
        var bLoc = abilityNumbers.indexOf(b.id);
        return aLoc - bLoc;
    }

    function updateSkillbar(numbers) {
        abilityNumbers = numbers;

        cu.RequestAllAbilities(abilities => {
            abilities = abilities.filter(ability => {
                return abilityNumbers.indexOf(ability.id) !== -1;
            });

            abilities.sort(sortByServerOrder);

            $skillButtons.empty().css('width', abilities.length * BUTTON_WIDTH + BUTTON_LEFT_OFFSET);

            abilities.forEach((ability, i) => {
                var button = ability.MakeButton(i);

                var elem = button.rootElement.css({ left: (i * BUTTON_WIDTH + BUTTON_LEFT_OFFSET) + 'px', top: '0' });

                if (ability.name) elem.attr('data-tooltip-title', ability.name);

                if (ability.tooltip) elem.attr('data-tooltip-content', ability.tooltip);

                $skillButtons.append(elem);
            });

            new Tooltip($skillButtons.children(), { leftOffset: 0, topOffset: -30 });
        });
    }

    cu.SetDebugServer();

    if (cu.HasAPI()) {
        cu.OnInitialized(() => {
            cuAPI.OnAbilityNumbersChanged(updateSkillbar);
        });
    }
}