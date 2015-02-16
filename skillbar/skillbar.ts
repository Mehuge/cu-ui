/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/// <reference path="../vendor/jquery.d.ts" />
/// <reference path="../cu/cu.ts" />

// Includes both legacy abilities and crafted abilities

module Skillbar {
    /* Constants */

    var BUTTON_WIDTH = 50;
    var BUTTON_LEFT_OFFSET = 5;

    /* jQuery Elements */

    var $skillButtons = cu.FindElement('#skillButtons');

    /* Variables */

    var abilityNumbers: string[] = [];
    var abilities = [];
    var tooltip = null;

    /* Functions */

    function sortByServerOrder(a, b) {
        if (!abilityNumbers || !abilityNumbers.length) return 0;
        var aLoc = abilityNumbers.indexOf(a.id);
        var bLoc = abilityNumbers.indexOf(b.id);
        if (aLoc === -1 && bLoc === -1) {
            aLoc = a.id;
            bLoc = b.id;
        } else if (aLoc === -1) {
            aLoc = Number.MAX_VALUE;
        } else if (bLoc === -1) {
            bLoc = Number.MAX_VALUE;
        }
        return aLoc - bLoc;
    }

    function getCraftedAbilities(loginToken, characterID) {
        if (!loginToken || !characterID) return Promise.reject();

        return new Promise((resolve, reject) => {
            $.getJSON(cu.SecureApiUrl('api/craftedabilities'), {
                loginToken: loginToken,
                characterID: characterID
            }).then(resolve, reject);
        });
    }

    function mapAbility(ability) {
        var a = new Ability(cu);

        a.id = _.isNumber(ability.id) ? ability.id.toString(16) : ability.id.toString();
        a.name = ability.name;
        a.icon = ability.icon;
        a.tooltip = ability.tooltip || ability.notes;

        return a;
    }

    function addAbility(ability, i) {
        var a = mapAbility(ability);

        var button = a.MakeButton(i);

        var elem = button.rootElement.css({ left: (i * BUTTON_WIDTH + BUTTON_LEFT_OFFSET) + 'px', top: '0' });

        if (a.name) elem.attr('data-tooltip-title', a.name);

        if (a.tooltip) elem.attr('data-tooltip-content', a.tooltip);

        $skillButtons.append(elem);
    }

    function updateSkillbarWidth(totalAbilities) {
        $skillButtons.css('width', totalAbilities * BUTTON_WIDTH + BUTTON_LEFT_OFFSET);
    }

    function updateTooltip() {
        if (tooltip) tooltip.destroy();

        tooltip = new Tooltip($skillButtons.children(), { leftOffset: 0, topOffset: -30 });
    }

    function updateSkillbar() {
        $skillButtons.empty();

        updateSkillbarWidth(abilities.length);

        abilities.sort(sortByServerOrder);

        abilities.forEach(addAbility);

        updateTooltip();
    }

    function getTotalAbilities() {
        return $skillButtons.children().length;
    }

    function onAbilityCreated(id, a) {
        var ability = JSON.parse(a);

        abilities.push(ability);

        var totalAbilities = getTotalAbilities();

        updateSkillbarWidth(totalAbilities + 1);

        addAbility(ability, totalAbilities);

        updateTooltip();
    }

    function registerAbility(craftedAbility) {
        var abilityID = craftedAbility.id.toString(16);
        var primaryComponent = getPrimaryComponent(craftedAbility);
        var primaryComponentBaseID = primaryComponent && primaryComponent.baseComponentID ? primaryComponent.baseComponentID.toString(16) : '';
        var secondaryComponent = getSecondaryComponent(craftedAbility);
        var secondaryComponentBaseID = secondaryComponent && secondaryComponent.baseComponentID ? secondaryComponent.baseComponentID.toString(16) : '';

        cuAPI.RegisterAbility(abilityID, primaryComponentBaseID, secondaryComponentBaseID);
    }

    function getPrimaryComponent(craftedAbility) {
        if (craftedAbility) {
            return craftedAbility.rootComponentSlot;
        }
    }

    function getSecondaryComponent(craftedAbility) {
        if (craftedAbility && craftedAbility.rootComponentSlot && craftedAbility.rootComponentSlot.children) {
            return craftedAbility.rootComponentSlot.children[0];
        }
    }

    function onCharacterIDChanged(characterID) {
        getCraftedAbilities(cuAPI.loginToken, characterID).then(craftedAbilities => {
            craftedAbilities.forEach(craftedAbility => {
                registerAbility(craftedAbility);
            });

            abilities = abilities.concat(craftedAbilities);

            updateSkillbar();
        }, () => {
            console.log('Failed to get crafted abilities.');
        });
    }

    function onAbilityNumbersChanged(numbers) {
        abilityNumbers = numbers;

        cu.RequestAllAbilities(a => {
            abilities = abilities.concat(a.filter(ability => {
                return abilityNumbers.indexOf(ability.id) !== -1;
            }));

            updateSkillbar();
        });
    }

    /* Initialization */

    if (cu.HasAPI()) {
        cu.OnInitialized(() => {
            cuAPI.OnCharacterIDChanged(onCharacterIDChanged);

            cuAPI.OnAbilityNumbersChanged(onAbilityNumbersChanged);

            cuAPI.OnAbilityCreated(onAbilityCreated);
        });
    }
}