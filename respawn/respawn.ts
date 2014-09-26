/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/// <reference path="../vendor/jquery.d.ts" />

module Respawn {
    var $respawn: JQuery = null;

    var $respawnKey: JQuery = null;

    var RESPAWN_CONFIG_NAME = 'Respawn';

    function initialize() {
        cu.GetConfigVar(RESPAWN_CONFIG_NAME);

        cu.Listen('HandleReceiveConfigVar', handleReceiveConfigVar);

        cu.Listen('HandleSavedConfigChanges', handleSavedConfigChanges);

        $respawn = cu.FindElement('#respawn');

        $respawnKey = cu.FindElement('#respawn-key');

        cu.RunAtInterval(update, 60);
    }

    function update() {
        if (cuAPI.hp) {
            $respawn.fadeOut();
        } else {
            $respawn.fadeIn();
        }
    }

    function handleReceiveConfigVar(configVar) {
        if (configVar) {
            var respawnConfigVar = configVar[RESPAWN_CONFIG_NAME];
            if (respawnConfigVar) {
                var key = KeyCode.dxKeyCodeMap[respawnConfigVar];
                if (key) {
                    $respawnKey.text(key);
                }
            }
        }
    }

    function handleSavedConfigChanges() {
        cu.GetConfigVar(RESPAWN_CONFIG_NAME);
    }

    if (typeof cu !== 'undefined' && typeof cuAPI !== 'undefined') {
        cuAPI.OnInitialized(initialize);
    }
}
