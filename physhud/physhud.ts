/* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/// <reference path="../vendor/jquery.d.ts" />

module PhysHUD {
    var $physHud: JQuery;

    function addToPhysHud(text) {
        $('<li>').text(text).appendTo($physHud);
    }


    function Update() {
        if (cu.HasAPI()) {
            $physHud.empty();

            addToPhysHud('position:       (' + (cuAPI.locationX || 0.0).toFixed(1) + ', ' + (cuAPI.locationY || 0.0).toFixed(1) + ', ' + (cuAPI.locationZ || 0.0).toFixed(1) + ')');
            addToPhysHud('serverPosition: (' + (cuAPI.serverLocationX || 0.0).toFixed(1) + ', ' + (cuAPI.serverLocationY || 0.0).toFixed(1) + ', ' + (cuAPI.serverLocationZ || 0.0).toFixed(1) + ')');

            addToPhysHud('horizontalVel:  ' + (cuAPI.horizontalSpeed || 0.0).toFixed(1) + ' m/s @ ' + (cuAPI.velFacing || 0).toFixed(0) + '°');

            addToPhysHud('downAngle:      ' + (cuAPI.downCollisionAngle || 0.0).toFixed(1) + '°');
            addToPhysHud('terrainAngle:   ' + (cuAPI.terrainCollisionAngle || 0.0).toFixed(1) + '°');
        }
    }

    cu.OnInitialized(() => {
        $physHud = cu.FindElement('#physHud');

        // How often we call Update
        var updateFPS = 15;
        cu.RunAtInterval(Update, updateFPS);
    });
}