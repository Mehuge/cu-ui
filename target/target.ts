/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/// <reference path="../vendor/jquery.d.ts" />

module Target {
    //	TODO: We can probably convert this to use Callbacks to feel more responsive and be more performant.

    var hpWidth: number = -1;
    var cachedName: string = "";
    var cachedHP: number = -1;
    var cachedFriendly: boolean = false;
    var cachedEffects: string = "[]";
    var $target: JQuery;
    var $name: JQuery;
    var $healthBar: JQuery;
    var $healthText: JQuery;
    var $effectsBox: JQuery;

    function Update() {
        var maxHP: number = 100;
        var curHP: number = -1;
        var name: string = "";
        var isFriendly: boolean = false;
        var effects: string = "[]";

        if (cu.HasAPI()) {
            curHP = cuAPI.targetHP;
            maxHP = cuAPI.targetMaxHP;
            name = cuAPI.targetName;
            isFriendly = cuAPI.isTargetFriendly;
            effects = cuAPI.targetEffects;
        }

        //	If this is the same information we had before, do nothing
        if (cachedName == name && cachedHP == curHP && cachedFriendly == isFriendly && cachedEffects == effects) return;

        cachedName = name;
        cachedHP = curHP;
        cachedFriendly = isFriendly;

        //	Only show this if we have a target
        if (curHP < 0 || !name) {
            $target.css('visibility', 'hidden');
            return;
        }

        $target.css('visibility', 'visible');

        //	Set the players name
        $name.text(name);

        //	Get the health bar and its width
        if (hpWidth < 0) hpWidth = $healthBar.width();

        //	Figure out our health ratio and set the health bar to it
        var hpRatio = curHP / maxHP;
        $healthBar.width(hpRatio * hpWidth);
        $healthText.text(curHP + "/" + maxHP);

        //	Set the health bar text color based on if they are friendly
        if (isFriendly) {
            $name.css("color", '#BBBBFF');
        } else {
            $name.css("color", '#FFBBBB');
        }

        if (cachedEffects != effects) {
            var fxList: any = $.parseJSON(effects);

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
        $target = cu.FindElement('#target');

        $name = cu.FindElement('#name');

        $healthBar = cu.FindElement('#healthBar');

        $healthText = cu.FindElement('#healthText');

        $effectsBox = cu.FindElement('#effectsBox');

        // How often we call Update
        var updateFPS = 10;
        cu.RunAtInterval(Update, updateFPS);
    });
}