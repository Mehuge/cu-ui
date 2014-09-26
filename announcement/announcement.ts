/* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/// <reference path="../vendor/jquery.d.ts" />
/// <reference path="../cu/cu.ts" />

module Announcement {
    var $announcement = cu.FindElement('#announcement');
    var $message = cu.FindElement('#message');

    var timeout;

    $announcement.click(hide);

    function show(message, type) {
        resetTimeout();

        $message.css('font-size', message.length < 20 ? 34 : 24).html(message);

        $announcement.css('visibility', 'visible').stop().fadeIn(() => {
            timeout = setTimeout(hide, 5000);
        });
    }

    function hide() {
        $announcement.stop().fadeOut(() => {
            if (timeout) {
                resetTimeout();

                $announcement.css('visibility', 'hidden');
            }
        });
    }

    function resetTimeout() {
        clearTimeout(timeout);
        timeout = null;
    }

    if (cu.HasAPI()) {
        cuAPI.OnAnnouncement(show);
    }
}