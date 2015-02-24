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
            var myFaction = $('.' + MiniMap.factionSelectors[MiniMap.myFaction]);
            myFaction.addClass('canselect');
            myFaction.on('click', (e) => {
                var respawnId = $(e.currentTarget).attr('respawnID');
                cuAPI.Respawn(respawnId);
            });
            cuAPI.ShowUI('respawn');
            MiniMap.drawMap();
            $respawn.fadeIn();
        }
    }

    function drawMap(): void {
        // update map
        MiniMap.controlPoints.forEach(p => {
            var temp = $('#' + p.id);
            temp.removeClass();
            temp.addClass(MiniMap.factionSelectors[p.faction]);
            if (p.faction == MiniMap.myFaction) {
                temp.addClass('canselect');
                temp.on('click', (e) => {
                    var respawnId = $(e.currentTarget).attr('respawnID');
                    cuAPI.Respawn(respawnId);
                });
            }
        });
        // Draw my position
        MiniMap.myPos = MiniMap.serverToCanvasPoint(cuAPI.locationX, cuAPI.locationY);

        var p = $('#playerPos');
        p.css('top', MiniMap.myPos.y - 5);
        p.css('left', MiniMap.myPos.x - 5);
    }

    // INITIALIZE!
    function initialize() {
        cuAPI.OnCharacterHealthChanged(updateHealth);
    }

    // START

    if (cu.HasAPI()) {
        MiniMap.width = 512;
        MiniMap.height = 512;
        MiniMap.iconScale = 1.0;
        MiniMap.updateFunction = drawMap;
        MiniMap.initialize();
        MiniMap.width = 512;
        MiniMap.height = 512;
        MiniMap.iconScale = 1.0;
        cu.OnInitialized(initialize);
    }
    $(".window").draggable();
}
