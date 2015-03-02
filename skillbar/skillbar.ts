/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/// <reference path="../vendor/jquery.d.ts" />
/// <reference path="../cu/cu.ts" />

module Skillbar {
    /* Constants */

    var BUTTON_WIDTH = 50;
    var BUTTON_LEFT_OFFSET = 5;

    /* jQuery Elements */

    var $skillButtons = cu.FindElement('#skillButtons');

    /* Variables */

    var abilities = [];
    var tooltip = null;

    /* Functions */

    function sortByAbilityID(a, b) {
        var aID = !_.isNumber(a.id) ? parseInt(a.id, 16) : a.id;
        var bID = !_.isNumber(b.id) ? parseInt(b.id, 16) : b.id;
        return aID - bID;
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

        abilities.sort(sortByAbilityID);

        abilities.forEach((ability, i) => {
            var button = ability.MakeButton(i);

            var elem = button.rootElement.css({ left: (i * BUTTON_WIDTH + BUTTON_LEFT_OFFSET) + 'px', top: '0' });

            if (ability.name) elem.attr('data-tooltip-title', ability.name);

            if (ability.tooltip) elem.attr('data-tooltip-content', ability.tooltip);

            $skillButtons.append(elem);
        });

        updateTooltip();
    }

    function onAbilityCreated(id, a) {
        var craftedAbility = JSON.parse(a);
        craftedAbility.id = craftedAbility.id.toString(16);
        craftedAbility.tooltip = craftedAbility.tooltip || craftedAbility.notes;

        registerAbility(craftedAbility);

        var ability = cu.UpdateAbility(craftedAbility);

        abilities.push(ability);

        updateSkillbar();
    }

    function removeAbilityById(id) {
        for (var i = abilities.length - 1; i >= 0; i--) {
            var ability = abilities[i];

            if (ability.id.toString(16) === id) {
                abilities.splice(i, 1);
            }
        }
    }

    function onAbilityDeleted(id) {
        removeAbilityById(id);

        updateSkillbar();
    }

    function registerAbility(craftedAbility) {
        var abilityID = craftedAbility.id;
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
        var req = cu.RequestAllAbilities(cuAPI.loginToken, characterID, abils => {
            abilities = abils;

            updateSkillbar();
        });

        if (!req) return;

        req.then(abils => {
            if (!abils || !abils.length) return;

            abils.sort(sortByAbilityID);

            abils.forEach(abil => {
                abil.id = abil.id.toString(16);
                abil.tooltip = abil.tooltip || abil.notes;

                registerAbility(abil);
            });

            cu.UpdateAllAbilities(abils);
        });
    }

    /* Initialization */

    if (cu.HasAPI()) {
        cu.OnInitialized(() => {
            cuAPI.OnCharacterIDChanged(onCharacterIDChanged);

            cuAPI.OnAbilityCreated(onAbilityCreated);

            cuAPI.OnAbilityDeleted(onAbilityDeleted);
        });
    }
}