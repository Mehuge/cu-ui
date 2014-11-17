/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

class EnemyTarget extends Target {
    bindChangedCallbacks() {
        if (cu.HasAPI()) {
            cu.OnInitialized(() => {
                cuAPI.OnEnemyTargetNameChanged(this.updateName.bind(this));

                cuAPI.OnEnemyTargetHealthChanged(this.updateHealth.bind(this));

                cuAPI.OnEnemyTargetStaminaChanged(this.updateStamina.bind(this));

                cuAPI.OnEnemyTargetEffectsChanged(this.updateEffects.bind(this));
            });
        }
    }
}

var enemyTarget = new EnemyTarget();
