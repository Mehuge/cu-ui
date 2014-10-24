/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

class EnemyTarget extends Target {
    /*
    getTargetPlayer(): TargetPlayer {
        var player = {
            name: '',
            hp: -1,
            maxHP: -1,
            energy: -1,
            maxEnergy: -1,
            effects: '[]',
            isFriendly: false
        };

        if (cu.HasAPI()) {
            player.name = cuAPI.enemyTargetName;
            player.hp = cuAPI.enemyTargetHP;
            player.maxHP = cuAPI.enemyTargetMaxHP;
            player.energy = cuAPI.enemyTargetEnergy;
            player.maxEnergy = cuAPI.enemyTargetMaxEnergy;
            player.effects = cuAPI.enemyTargetEffects;
        }

        return player;
    }
    */
}

var enemyTarget = new EnemyTarget();
