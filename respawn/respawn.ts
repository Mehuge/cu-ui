/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/// <reference path="../vendor/jquery.d.ts" />

module Respawn {
    var $respawn = cu.FindElement('#respawn');

    // Functions
    function updateHealth(health) {
        if (health) {
            cuAPI.HideUI('respawn');
            $respawn.fadeOut();
        } else {
            cuAPI.ShowUI('respawn');
            MiniMap.drawMap(MiniMap.mousePos);
            $respawn.fadeIn();
        }
    }

    function getMousePos(canvas, e): MiniMap.IPoint {
        var rect = canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }

    // INITIALIZE!
    function initialize() {
        

        // Handle hover color change
        MiniMap.canvas.addEventListener('mousemove', e => {
            MiniMap.update(getMousePos(MiniMap.canvas, e))
        }, false);

        // Handle clicks on a spawn point
        MiniMap.canvas.addEventListener('mousedown', e => {
            MiniMap.mousePos = getMousePos(MiniMap.canvas, e);
            if (typeof MiniMap.controlPoints !== 'undefined' && MiniMap.controlPoints !== null) {
                MiniMap.controlPoints.forEach(point => {
                    var r = MiniMap.radiusForSize(point.size);
                    if (point.faction === MiniMap.myFaction &&
                        Math.abs(MiniMap.mousePos.x - point.x) < r &&
                        Math.abs(MiniMap.mousePos.y - point.y) < r) {

                        // Request respawn at selected!
                        cuAPI.Respawn(point.id);
                    }
                });
            }

            if (typeof MiniMap.spawnPoints !== 'undefined' && MiniMap.spawnPoints !== null) {
                MiniMap.spawnPoints.forEach(point => {
                    var r = MiniMap.radiusForSize(point.size);
                    if (point.faction === MiniMap.myFaction &&
                        Math.abs(MiniMap.mousePos.x - point.x) < r &&
                        Math.abs(MiniMap.mousePos.y - point.y) < r) {

                        // Request respawn at selected!
                        cuAPI.Respawn(point.id);
                    }
                });
            }
        }, false);

        cuAPI.OnCharacterHealthChanged(updateHealth);
    }

    // START

    if (cu.HasAPI()) {
        MiniMap.width = 512;
        MiniMap.height = 512;
        MiniMap.initialize();
        cu.OnInitialized(initialize);
    }


}
