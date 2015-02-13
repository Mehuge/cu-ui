/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/// <reference path="../componentConstants.ts" />
/// <reference path="../componentSlot.ts" />
/// <reference path="../componentBranch.ts" />
/// <reference path="../componentNetwork.ts" />

var song3 = new ComponentSlot({
    type: ComponentType.OptionalModifier,
    subType: ComponentSubType.Technique,
    x: 18,
    y: 5,
    branch: new ComponentBranch({
        parts: [
            {
                direction: ComponentBranchDirection.Horizontal,
                x: 16,
                y: 6
            }, {
                direction: ComponentBranchDirection.Horizontal,
                x: 18,
                y: 6
            }
        ]
    })
});

var song2 = new ComponentSlot({
    type: ComponentType.Secondary,
    subType: ComponentSubType.Song,
    x: 12,
    y: 5,
    children: [song3],
    branch: new ComponentBranch({
        parts: [
            {
                direction: ComponentBranchDirection.Horizontal,
                x: 10,
                y: 6
            }
        ]
    })
});

var song1 = new ComponentSlot({
    type: ComponentType.Primary,
    subType: ComponentSubType.Instrument,
    x: 6,
    y: 5,
    children: [song2]
});

var song = new ComponentNetwork({
    name: SONG_COMPONENT_NETWORK,
    slots: [song1, song2, song3]
});