/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/// <reference path="../vendor/jquery.d.ts" />

// TODO: We can probably convert this to use Callbacks to feel more responsive and be more performant.

interface TargetPlayer {
    name: string;
    hp: number;
    maxHP: number;
    energy: number;
    maxEnergy: number;
    effects: string;
    isFriendly: boolean;
}

class Target {
    cachedName: string = '';
    cachedHP: number = -1;
    cachedMaxHP: number = -1;
    cachedEnergy: number = -1;
    cachedMaxEnergy: number = -1;
    cachedEffects: string = '[]';
    cachedIsFriendly: boolean = undefined;
    $target: JQuery;
    $name: JQuery;
    $healthBar: JQuery;
    healthBarWidth: number = -1;
    $healthText: JQuery;
    $energyBar: JQuery;
    energyBarWidth: number = -1;
    $energyText: JQuery;
    $effects: JQuery;

    constructor() {
        cu.OnInitialized(() => {
            this.$target = cu.FindElement('#target');

            this.$name = cu.FindElement('#name');

            this.$healthBar = cu.FindElement('#health-bar');

            this.healthBarWidth = this.$healthBar.width();

            this.$healthText = cu.FindElement('#health-text');

            this.$energyBar = cu.FindElement('#energy-bar');

            this.energyBarWidth = this.$energyBar.width();

            this.$energyText = cu.FindElement('#energy-text');

            this.$effects = cu.FindElement('#effects');

            // How often we call Update
            var updateFPS = 10;
            cu.RunAtInterval(this.update.bind(this), updateFPS);
        });
    }

    getTargetPlayer(): TargetPlayer {
        var player = {
            name: '',
            hp: -1,
            maxHP: -1,
            energy: -1,
            maxEnergy: -1,
            effects: '[]',
            isFriendly: undefined
        };

        return player;
    }

    update() {
        var player = this.getTargetPlayer();

        // Only show this if we have a target
        if (!player || player.hp < 0 || !player.name) {
            this.$target.css('visibility', 'hidden');
            return;
        }

        this.$target.css('visibility', 'visible');

        if (player.name !== this.cachedName) {
            this.cachedName = player.name;

            // Set the players name
            this.$name.text(player.name);
        }

        if (player.hp !== this.cachedHP || player.maxHP !== this.cachedMaxHP) {
            this.cachedHP = player.hp;
            this.cachedMaxHP = player.maxHP;

            // Figure out our health ratio and set the health bar to it
            var hpRatio = player.hp / player.maxHP;
            this.$healthBar.width(hpRatio * this.healthBarWidth);
            this.$healthText.text(player.hp + ' / ' + player.maxHP);
        }

        if (_.isNumber(player.energy) && _.isNumber(player.maxEnergy) && (player.energy !== this.cachedEnergy || player.maxEnergy !== this.cachedMaxEnergy)) {
            this.cachedEnergy = player.energy;
            this.cachedMaxEnergy = player.maxEnergy;

            // Figure out our energy ratio and set the energy bar to it
            var energyRatio = player.energy / player.maxEnergy;
            this.$energyBar.width(energyRatio * this.energyBarWidth);
            this.$energyText.text(player.energy + ' / ' + player.maxEnergy);
        }

        if (player.effects !== this.cachedEffects) {
            this.cachedEffects = player.effects;

            var fxList: any = $.parseJSON(player.effects);

            this.$effects.empty(); // TODO: Don't burn effects if they're still alive

            for (var i = 0; i < fxList.length; ++i) {
                var fx = fxList[i];
                var img = $('<img />').addClass('effect-icon').attr('src', fx.icon);
                img.appendTo(this.$effects);
            }
        }

        if (player.isFriendly !== this.cachedIsFriendly) {
            this.cachedIsFriendly = player.isFriendly;

            if (player.isFriendly) {
                this.$name.addClass('friendly').removeClass('enemy');
            } else {
                this.$name.addClass('enemy').removeClass('friendly');
            }
        }
    }
}