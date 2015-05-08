/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/// <reference path="../vendor/jquery.d.ts" />

module Kills {
    var $close: JQuery;
    var $kills: JQuery;

    function onReady() {
        if (!cu.HasAPI()) return;

        $close = cu.FindElement('#close');

        $kills = cu.FindElement('#kills');

        $close.click(closeWindow);

        function getKills() {
            $.ajax({
                type: 'GET',
                url: cu.ApiUrl('kills'),
                data: { killer: cuAPI.characterID },
                timeout: 5000
            }).done(kills => done(kills))
              .fail((xhr, status, error) => alert(error));
        }

        getKills();
        setInterval(getKills, 10000);
    }

    function done(kills) {
        kills.sort((a, b) => {
            a = new Date(a.id.creationTime);
            b = new Date(b.id.creationTime);
            return a > b ? -1 : a < b ? 1 : 0;
        });

        $kills.text('');
        var numKills = Math.min(kills.length, 10);
        for (var i = 0; i < numKills; i++) {
            var kill = kills[i];
            if (!kill || !kill.victim) continue;
            $('<div class="kill"></div>')
                .addClass(cu.GetFactionCssClassName(kill.victim.faction))
                .text(cu.GetPlayerName(kill.victim))
                .appendTo($kills);
        }
    }

    function closeWindow() {
        cuAPI.CloseUI('kills');
    }

    cu.OnInitialized(onReady);
}