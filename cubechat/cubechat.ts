/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/// <reference path="../vendor/jquery.d.ts" />
/// <reference path="../vendor/jquery.terminal.d.ts" />
/// <reference path="../vendor/lodash.d.ts" />
/// <reference path="../vendor/strophe.d.ts" />

module CubeChat {
    
    // INITIALIZE!
    function initialize() {
        ChatLib.onWebSocketConnected = () => {
            cu.JoinRoomAsCurrentUser(cu.GLOBAL_CHATROOM);
            cu.JoinRoomAsCurrentUser(cu.CUBE_CHATROOM);
        }
        ChatLib.initChat([cu.CUBE_CHATROOM_NAME, cu.GLOBAL_CHATROOM_NAME], true);
        ChatLib.connect(cuAPI.loginToken);
    }

    // START
    cu.OnInitialized(() => {
        initialize();
    });
}