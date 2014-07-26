/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/// <reference path="../vendor/jquery.d.ts" />

module Character {

    cuAPI.OpenUI("addons.ui");

    var hpWidth: number = -1;
    var manaWidth: number = -1;
    var cachedEffects: string = "[]";
    var $healthBar: JQuery;
    var $manaBar: JQuery;
    var $healthText: JQuery;
    var $name: JQuery;
    var $effectsBox: JQuery;

    function Update() {
        if (hpWidth < 0) hpWidth = $healthBar.width();
        if (manaWidth < 0) manaWidth = $manaBar.width();

        var maxHP = 1000;
        var curHP = Math.round(Math.random() * maxHP);
        var name = "";
        var effects = "[]";
        if (cu.HasAPI()) {
            curHP = cuAPI.hp;
            maxHP = cuAPI.maxHP;
            name = cuAPI.characterName;
            effects = cuAPI.selfEffects;
        }
        var hpRatio = curHP / maxHP;
        $healthBar.width(hpRatio * hpWidth);
        $healthText.text(curHP + "/" + maxHP);
        $name.text(name);

        var maxMana = 500;
        var curMana = maxMana;
        var manaRatio = curMana / maxMana;
        $manaBar.width(manaRatio * manaWidth);

        if (cachedEffects != effects) {
            var fxList: any = [];

            if (_.isString(effects)) {
                fxList = $.parseJSON(effects);
            }

            $effectsBox.empty(); // TODO: Don't burn effects if they're still alive

            for (var i = 0; i < fxList.length; ++i) {
                var fx = fxList[i];
                var img = $('<img />').attr({ 'class': 'effectIcon', 'src': fx.icon });
                img.appendTo($effectsBox);
            }

            cachedEffects = effects;
        }
    }

    cu.OnInitialized(() => {
        $healthBar = cu.FindElement('#healthBar');

        $manaBar = cu.FindElement('#manaBar');

        $healthText = cu.FindElement('#healthText');

        $name = cu.FindElement('#name');

        $effectsBox = cu.FindElement('#effectsBox');

        // How often we call Update
        var updateFPS = 5;
        cu.RunAtInterval(Update, updateFPS);

    });
}