/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

class FriendlyTarget extends Target {
    /*
    getTargetPlayer(): TargetPlayer {
        var player = {
            name: '',
            hp: -1,
            maxHP: -1,
            energy: -1,
            maxEnergy: -1,
            effects: '[]',
            isFriendly: true
        };

        if (cu.HasAPI()) {
            player.name = cuAPI.friendTargetName;
            player.hp = cuAPI.friendTargetHP;
            player.maxHP = cuAPI.friendTargetMaxHP;
            player.energy = cuAPI.friendTargetEnergy;
            player.maxEnergy = cuAPI.friendTargetMaxEnergy;
            player.effects = cuAPI.friendTargetEffects;
        }

        return player;
    }
    */
}

var friendlyTarget = new FriendlyTarget();
