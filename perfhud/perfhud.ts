/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/// <reference path="../vendor/jquery.d.ts" />

module PerfHUD {
    var $perfHud: JQuery;

    function addToPerfHud(text) {
        $('<li>').text(text).appendTo($perfHud);
    }

    function Update() {
        if (cu.HasAPI()) {
            $perfHud.empty();

            addToPerfHud((cuAPI.fps || 0).toFixed(1) + ' fps /' + (cuAPI.frameTime || 0).toFixed(1) + ' msec');

            addToPerfHud('lag ' + Math.round(cuAPI.netstats_lag || 0) + ' msec');

            addToPerfHud('tcp ' + Math.round(cuAPI.netstats_tcpBytes || 0) + ' B / ' + Math.round(cuAPI.netstats_tcpMessages || 0) + ' msg (' + ((cuAPI.netstats_tcpBytes || 0) / (cuAPI.netstats_tcpMessages || 0)).toFixed(1) + ' B/msg)');

            addToPerfHud('udp ' + Math.round(cuAPI.netstats_udpBytes || 0) + ' B / ' + Math.round(cuAPI.netstats_udpPackets || 0) + ' pkt (' + ((cuAPI.netstats_udpBytes || 0) / (cuAPI.netstats_udpPackets || 0)).toFixed(1) + ' B/pkt)');

            addToPerfHud('plNew ' + ((cuAPI.netstats_players_newBits || 0) / 8).toFixed(1) + ' B / ' + Math.round(cuAPI.netstats_players_newCount || 0) + ' E (' + ((cuAPI.netstats_tcpBytes || 0) / (cuAPI.netstats_players_newCount || 0)).toFixed(1) + ' b/E)');

            addToPerfHud('plUpd ' + ((cuAPI.netstats_players_updateBits || 0) / 8).toFixed(1) + ' B / ' + Math.round(cuAPI.netstats_players_udpateCount || 0) + ' E (' + ((cuAPI.netstats_players_updateBits || 0) / (cuAPI.netstats_players_udpateCount || 0)).toFixed(1) + ' b/E)');

            addToPerfHud('position: (' + (cuAPI.locationX || 0).toFixed(1) + ', ' + (cuAPI.locationY || 0).toFixed(1) + ', ' + (cuAPI.locationZ || 0).toFixed(1) + ')');

            addToPerfHud('speed: ' + (cuAPI.speed || 0).toFixed(1));

            addToPerfHud('particles rendered: ' + (cuAPI.particlesRenderedCount || 0));
        }
    }

    cu.OnInitialized(() => {
        $perfHud = cu.FindElement('#perfHud');

        // How often we call Update
        var updateFPS = 5;
        cu.RunAtInterval(Update, updateFPS);
    });
}