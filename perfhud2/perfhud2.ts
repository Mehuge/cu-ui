/* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/// <reference path="../vendor/jquery.d.ts" />

module PerfHUD2 {
    var $physHud: JQuery;
    var $netHud: JQuery;
    var $tabs: JQuery;
    var $containers: JQuery;

    function addToTab(text, container, extraClass = "") {
        $('<li>').text(text).addClass(extraClass).appendTo(container);
    }

    function ProblemIf(cond) {
        if (cond) return "problem";
        return "";
    }

    function Update() {
        if (cu.HasAPI()) {
            $physHud.empty();
            addToTab('position:       (' + (cuAPI.locationX || 0.0).toFixed(1) + ', ' + (cuAPI.locationY || 0.0).toFixed(1) + ', ' + (cuAPI.locationZ || 0.0).toFixed(1) + ')', $physHud);
            addToTab('serverPosition: (' + (cuAPI.serverLocationX || 0.0).toFixed(1) + ', ' + (cuAPI.serverLocationY || 0.0).toFixed(1) + ', ' + (cuAPI.serverLocationZ || 0.0).toFixed(1) + ')', $physHud);
            addToTab('horizontalVel:  ' + (cuAPI.horizontalSpeed || 0.0).toFixed(1) + ' m/s @ ' + (cuAPI.velFacing || 0).toFixed(0) + '°', $physHud);
            addToTab('downAngle:      ' + (cuAPI.downCollisionAngle || 0.0).toFixed(1) + '°', $physHud);
            addToTab('terrainAngle:   ' + (cuAPI.terrainCollisionAngle || 0.0).toFixed(1) + '°', $physHud);

            $netHud.empty();
            addToTab('latency (msec):      ' + (cuAPI.netstats_lag || 0.000).toFixed(1), $netHud, ProblemIf(cuAPI.netstats_lag > 250));
            addToTab('time delta (msec):   ' + (cuAPI.netstats_delay || 0.000).toFixed(1), $netHud, ProblemIf(Math.abs(cuAPI.netstats_delay) > 250));
            addToTab('tcp messages / s:    ' + (cuAPI.netstats_tcpMessages || 0.000).toFixed(1), $netHud);
            addToTab('tcp bytes / s:       ' + (cuAPI.netstats_tcpBytes || 0.000).toFixed(1), $netHud);
            addToTab('udp packets / s:     ' + (cuAPI.netstats_udpPackets || 0.000).toFixed(1), $netHud, ProblemIf(cuAPI.netstats_udpPackets == 0));
            addToTab('udp bytes / s:       ' + (cuAPI.netstats_udpBytes || 0.000).toFixed(1), $netHud);
            addToTab('self updates / s:    ' + (cuAPI.netstats_selfUpdatesPerSec || 0.000).toFixed(1), $netHud, ProblemIf(cuAPI.netstats_selfUpdatesPerSec < 0.25));
            addToTab('syncs / s:           ' + (cuAPI.netstats_syncsPerSec || 0.000).toFixed(1), $netHud, ProblemIf(cuAPI.netstats_syncsPerSec > 0.0));
        }
    }

    function ClickTab(element) {
        $containers.removeClass('visible');
        var href = $('a', element).attr('href');
        $(href).addClass('visible');
    }

    cu.OnInitialized(() => {
        $physHud = cu.FindElement('#physHud');
        $netHud = cu.FindElement('#netHud');
        $tabs = $('#tabs li');
        $containers = $('.container');

        $tabs.each(function (index) {
            this.onclick = function () { ClickTab(this); };
        });

        // How often we call Update
        var updateFPS = 15;
        cu.RunAtInterval(Update, updateFPS);
    });
}