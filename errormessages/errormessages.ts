/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/// <reference path="../vendor/jquery.d.ts" />
/// <reference path="../cu/cu.ts" />

module ErrorMessages {
    var $messages = $('#messages');

    cu.Listen('HandleAbilityError', (message) => {
        if (!message) return;

        var messageText = getMessageText(message);

        if (!messageText) return;

        var $newMessage = $('<li>').addClass('message').append(messageText).prependTo($messages);

        setTimeout(() => {
            $newMessage.stop().fadeOut(() => {
                $newMessage.remove();
            });
        }, 3000);

        removeLastMessage();
    });

    function removeLastMessage() {
        var $msgs = $('.message');

        if ($msgs.length <= 3) return;

        $msgs.last().remove();

        removeLastMessage();
    }

    function getMessageText(message) {
        switch (message) {
            case 1: return 'Your target is out of range.';
            case 2: return 'Your target is invalid.';
            case 3: return 'Your target is not in line of sight.';
            case 4: return 'That ability is still on cooldown.';
            case 5: return 'You don\'t have a target.';
            case 6: return 'You were interrupted!';
            case 7: return 'You do not have enough stamina.';
            default: return '';
        }
    }
}