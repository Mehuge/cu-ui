/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/// <reference path="../vendor/jquery.d.ts" />

module PerfHUD {
    var $perfHud: JQuery;

    function Update() {
        if (cu.HasAPI()) {
            $perfHud.html(
                cuAPI.fps.toFixed(1) + " fps /" +
                cuAPI.frameTime.toFixed(1) + " msec<br/>" +
                "lag " + Math.round(cuAPI.netstats_lag) + " msec<br/>" +
                "tcp " + Math.round(cuAPI.netstats_tcpBytes) + " B / " + Math.round(cuAPI.netstats_tcpMessages) + " msg (" + (cuAPI.netstats_tcpBytes / cuAPI.netstats_tcpMessages).toFixed(1) + " B/msg)<br/>" +
                "udp " + Math.round(cuAPI.netstats_udpBytes) + " B / " + Math.round(cuAPI.netstats_udpPackets) + " pkt (" + (cuAPI.netstats_udpBytes / cuAPI.netstats_udpPackets).toFixed(1) + " B/pkt)<br/>" +
                "plNew " + (cuAPI.netstats_players_newBits / 8).toFixed(1) + " B / " + Math.round(cuAPI.netstats_players_newCount) + " E (" + (cuAPI.netstats_tcpBytes / cuAPI.netstats_players_newCount).toFixed(1) + " b/E)<br/>" +
                "plUpd " + (cuAPI.netstats_players_updateBits / 8).toFixed(1) + " B / " + Math.round(cuAPI.netstats_players_udpateCount) + " E (" + (cuAPI.netstats_players_updateBits / cuAPI.netstats_players_udpateCount).toFixed(1) + " b/E)<br/>" +
                "position: (" + (cuAPI.locationX).toFixed(1) + ", " + (cuAPI.locationY).toFixed(1) + ", " + (cuAPI.locationZ).toFixed(1) + ")<br/>" +
                "speed: " + (cuAPI.speed).toFixed(1)
                );
        }
    }

    cu.OnInitialized(() => {
        $perfHud = cu.FindElement('#perfHud');

        // How often we call Update
        var updateFPS = 5;
        cu.RunAtInterval(Update, updateFPS);
    });
}