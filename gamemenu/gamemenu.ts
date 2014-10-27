/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module GameMenu {
    $('#btn-options').click(() => {
        cuAPI.OpenUI('options.ui');
        cuAPI.CloseUI('gamemenu');
    });

    $('#btn-quit').click(() => {
        cuAPI.Quit();
    });

    $('#btn-cancel').click(() => {
        cuAPI.CloseUI('gamemenu');
    });
}