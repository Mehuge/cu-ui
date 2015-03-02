/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/// <reference path="../vendor/jquery.d.ts" />

module Character {
    var $portrait = cu.FindElement('#portrait');
    var $name = cu.FindElement('#name');
    var $healthBar = cu.FindElement('#health-bar');
    var healthBarWidth = $healthBar.width();
    var $healthText = cu.FindElement('#health-text');
    var $staminaBar = cu.FindElement('#stamina-bar');
    var staminaBarWidth = $staminaBar.width();
    var $staminaText = cu.FindElement('#stamina-text');
    var $effects = cu.FindElement('#effects');

    function updateRace(race: number) {
        var raceName = Race[race];
        if (raceName) $portrait.css('background', 'transparent url(../images/races/portraits/' + raceName.toLowerCase() + '.jpg) no-repeat top left');
    }

    function updateName(name: string) {
        $name.text(name || '');
    }

    function updateHealth(health: number, maxHealth: number) {
        if (maxHealth > 0) {
            var healthRatio = health / maxHealth;
            $healthBar.width(healthRatio * healthBarWidth);
            $healthText.text(health + ' / ' + maxHealth);
        } else {
            $healthBar.width(0);
            $healthBar.text('');
        }
    }

    function updateStamina(stamina: number, maxStamina: number) {
        if (maxStamina > 0) {
            var staminaRatio = stamina / maxStamina;
            $staminaBar.width(staminaRatio * staminaBarWidth);
            $staminaText.text(stamina + ' / ' + maxStamina);
        } else {
            $staminaBar.width(0);
            $staminaBar.text('');
        }
    }

    function updateEffects(effects: string) {
        var fxList: any = $.parseJSON(effects);

        $effects.empty(); // TODO: Don't burn effects if they're still alive

        for (var i = 0; i < fxList.length; ++i) {
            var fx = fxList[i];
            var img = $('<img />').addClass('effect-icon').attr('src', fx.icon);
            img.appendTo($effects);
        }
    }

    if (cu.HasAPI()) {
        cu.OnInitialized(() => {
            cuAPI.OnCharacterRaceChanged(updateRace);

            cuAPI.OnCharacterNameChanged(updateName);

            cuAPI.OnCharacterHealthChanged(updateHealth);

            cuAPI.OnCharacterStaminaChanged(updateStamina);

            cuAPI.OnCharacterEffectsChanged(updateEffects);

            // Launch addons UI
            cuAPI.OpenUI("mehuge-autoexec.ui"); //
        });
    }
}
