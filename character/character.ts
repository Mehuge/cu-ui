/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/// <reference path="../vendor/jquery.d.ts" />

module Character {
    var cachedRace: number = -1;
    var cachedName: string = '';
    var cachedHP: number = 0;
    var cachedMaxHP: number = 0;
    var cachedEnergy: number = 0;
    var cachedMaxEnergy: number = 0;
    var cachedEffects: string = '[]';
    var $portrait: JQuery;
    var $name: JQuery;
    var $healthBar: JQuery;
    var healthBarWidth: number = -1;
    var $healthText: JQuery;
    var $energyBar: JQuery;
    var energyBarWidth: number = -1;
    var $energyText: JQuery;
    var $effects: JQuery;

    function Update() {
        var race = -1;
        var name = '';
        var hp = 0;
        var maxHP = 0;
        var energy = 0;
        var maxEnergy = 0;
        var effects = '[]';

        if (cu.HasAPI()) {
            race = cuAPI.race;
            name = cuAPI.characterName;
            hp = cuAPI.hp;
            maxHP = cuAPI.maxHP;
            energy = cuAPI.energy;
            maxEnergy = cuAPI.maxEnergy;
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

        if (_.isNumber(energy) && _.isNumber(maxEnergy) && (energy !== cachedEnergy || maxEnergy !== cachedMaxEnergy)) {
            cachedEnergy = energy;
            cachedMaxEnergy = maxEnergy;

            var energyRatio = energy / maxEnergy;
            $energyBar.width(energyRatio * energyBarWidth);
            $energyText.text(energy + ' / ' + maxEnergy);
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

        $energyBar = cu.FindElement('#energy-bar');

        energyBarWidth = $energyBar.width();

        $energyText = cu.FindElement('#energy-text');

        $effects = cu.FindElement('#effects');

        cuAPI.OpenUI("addons.ui");

        // How often we call Update
        var updateFPS = 5;
        cu.RunAtInterval(Update, updateFPS);
    });
}