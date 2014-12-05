/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/// <reference path="../vendor/jquery.d.ts" />

class Target {
    $target = cu.FindElement('#target');
    $name = cu.FindElement('#name');
    $healthBar = cu.FindElement('#health-bar');
    healthBarWidth = this.$healthBar.width();
    $healthText = cu.FindElement('#health-text');
    $staminaBar = cu.FindElement('#stamina-bar');
    staminaBarWidth = this.$staminaBar.width();
    $staminaText = cu.FindElement('#stamina-text');
    $effects = cu.FindElement('#effects');

    constructor() {
        this.bindChangedCallbacks();
    }

    bindChangedCallbacks() {}

    updateVisibility(condition: boolean): boolean {
        return this.$target.css('visibility', condition ? 'visible' : 'hidden') && condition;
    }

    updateName(name: string) {
        if (!this.updateVisibility(name && name.length > 0)) return;

        this.$name.text(name);
    }

    updateHealth(health: number, maxHealth: number) {
        if (!this.updateVisibility(health >= 0 && maxHealth >= 0)) return;

        var healthRatio = health / maxHealth;
        this.$healthBar.width(healthRatio * this.healthBarWidth);
        this.$healthText.text(health + ' / ' + maxHealth);
    }

    updateStamina(stamina: number, maxStamina: number) {
        if (maxStamina > 0) {
            var staminaRatio = stamina / maxStamina;
            this.$staminaBar.width(staminaRatio * this.staminaBarWidth);
            this.$staminaText.text(stamina + ' / ' + maxStamina);
        } else {
            this.$staminaBar.width(0);
            this.$staminaText.text('');
        }
    }

    updateEffects(effects: string) {
        var fxList: any = $.parseJSON(effects);

        this.$effects.empty(); // TODO: Don't burn effects if they're still alive

        for (var i = 0; i < fxList.length; ++i) {
            var fx = fxList[i];
            var img = $('<img />').addClass('effect-icon').attr('src', fx.icon);
            img.appendTo(this.$effects);
        }
    }
}