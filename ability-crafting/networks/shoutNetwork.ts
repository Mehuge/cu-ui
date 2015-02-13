/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
 
/// <reference path="../componentConstants.ts" />
/// <reference path="../componentSlot.ts" />
/// <reference path="../componentBranch.ts" />
/// <reference path="../componentNetwork.ts" />

var shout3 = new ComponentSlot({
    type: ComponentType.OptionalModifier,
    subType: ComponentSubType.Inflection,
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

var shout2 = new ComponentSlot({
    type: ComponentType.Secondary,
    subType: ComponentSubType.Shout,
    x: 12,
    y: 5,
    children: [shout3],
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

var shout1 = new ComponentSlot({
    type: ComponentType.Primary,
    subType: ComponentSubType.Voice,
    x: 6,
    y: 5,
    children: [shout2]
});

var shout = new ComponentNetwork({
    name: SHOUT_COMPONENT_NETWORK,
    slots: [shout1, shout2, shout3]
});