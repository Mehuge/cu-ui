/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/// <reference path="../vendor/jquery.d.ts" />

module Diagnostic {
    var $logArea = $("#logArea");
    var $bufferSize = $("#bufferSize");
    var $logLevel = $("#logLevel");

    document.oncontextmenu = () => false;

    function onLogMessage(category, level, time, process, thread, message) {
        if (level < $logLevel.val()) return;
        jQuery("<div/>", {
            text: category + " | " + level + " | " + time + " | " + process + " | " + thread + " | " + message,
            class: "logEntry"
        }).appendTo($logArea);

        var maxCount = $bufferSize.val();
        while ($logArea.children().length > maxCount) $logArea.children().first().remove();
    }

    function initialize() {
        cuAPI.OnLogMessage(onLogMessage);
    }

    if (typeof cuAPI !== 'undefined') {
        cuAPI.OnInitialized(initialize);
    }
}