/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/// <reference path="../vendor/jquery.d.ts" />

module Character {
    var cachedRace: number = -1;
    var cachedName: string = '';
    var cachedHP: number = 0;
    var cachedMaxHP: number = 0;
    var cachedStamina: number = 0;
    var cachedMaxStamina: number = 0;
    var cachedEffects: string = '[]';
    var $portrait: JQuery;
    var $name: JQuery;
    var $healthBar: JQuery;
    var healthBarWidth: number = -1;
    var $healthText: JQuery;
    var $staminaBar: JQuery;
    var staminaBarWidth: number = -1;
    var $staminaText: JQuery;
    var $effects: JQuery;

    function Update() {
        var race = -1;
        var name = '';
        var hp = 0;
        var maxHP = 0;
        var stamina = 0;
        var maxStamina = 0;
        var effects = '[]';

        if (cu.HasAPI()) {
            race = cuAPI.race;
            name = cuAPI.characterName;
            hp = cuAPI.hp;
            maxHP = cuAPI.maxHP;
            stamina = cuAPI.stamina;
            maxStamina = cuAPI.maxStamina;
            effects = cuAPI.selfEffects;
        }

        if (race !== cachedRace) {
            cachedRace = race;

            var raceName = Race[race];

            if (_.isString(raceName)) {
                $portrait.css('background', 'transparent url(../images/races/portraits/' + raceName.toLowerCase() + '.jpg) no-repeat top left');
            }
        }

        if (name !== cachedName) {
            cachedName = name;

            $name.text(name);
        }

        if (_.isNumber(hp) && _.isNumber(maxHP) && (hp !== cachedHP || maxHP !== cachedMaxHP)) {
            cachedHP = hp;
            cachedMaxHP = maxHP;

            var hpRatio = hp / maxHP;
            $healthBar.width(hpRatio * healthBarWidth);
            $healthText.text(hp + ' / ' + maxHP);
        }

        if (_.isNumber(stamina) && _.isNumber(maxStamina) && (stamina !== cachedStamina || maxStamina !== cachedMaxStamina)) {
            cachedStamina = stamina;
            cachedMaxStamina = maxStamina;

            var staminaRatio = stamina / maxStamina;
            $staminaBar.width(staminaRatio * staminaBarWidth);
            $staminaText.text(stamina + ' / ' + maxStamina);
        }

        if (effects !== cachedEffects) {
            cachedEffects = effects;

            var fxList: any = [];

            if (_.isString(effects)) {
                fxList = $.parseJSON(effects);
            }

            $effects.empty(); // TODO: Don't burn effects if they're still alive

            for (var i = 0; i < fxList.length; ++i) {
                var fx = fxList[i];
                var img = $('<img />').addClass('effect-icon').attr('src', fx.icon);
                img.appendTo($effects);
            }
        }
    }

    cu.OnInitialized(() => {
        $portrait = cu.FindElement('#portrait');

        $name = cu.FindElement('#name');

        $healthBar = cu.FindElement('#health-bar');

        healthBarWidth = $healthBar.width();

        $healthText = cu.FindElement('#health-text');

        $staminaBar = cu.FindElement('#stamina-bar');

        staminaBarWidth = $staminaBar.width();

        $staminaText = cu.FindElement('#stamina-text');

        $effects = cu.FindElement('#effects');

        cuAPI.OpenUI("addons.ui");

        // How often we call Update
        var updateFPS = 5;
        cu.RunAtInterval(Update, updateFPS);
    });
}