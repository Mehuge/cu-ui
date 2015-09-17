/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/// <reference path="../componentConstants.ts" />
/// <reference path="../componentSlot.ts" />
/// <reference path="../componentBranch.ts" />
/// <reference path="../componentNetwork.ts" />

var rangeA9 = new ComponentSlot({
    type: ComponentType.OptionalModifier,
    subType: ComponentSubType.Aim,
    x: 18,
    y: 21,
    branch: new ComponentBranch({
        parts: [
            {
                direction: ComponentBranchDirection.Horizontal,
                x: 14,
                y: 22
            }, {
                direction: ComponentBranchDirection.Horizontal,
                x: 16,
                y: 22
            }, {
                direction: ComponentBranchDirection.Horizontal,
                x: 18,
                y: 22
            }
        ]
    })
});

var rangeA8 = new ComponentSlot({
    type: ComponentType.Modal,
    subType: ComponentSubType.Prepare,
    x: 12,
    y: 21,
    children: [rangeA9],
    branch: new ComponentBranch({
        parts: [
            {
                direction: ComponentBranchDirection.Horizontal,
                x: 10,
                y: 22
            }, {
                direction: ComponentBranchDirection.Horizontal,
                x: 12,
                y: 22
            }
        ]
    })
});

var rangeA7 = new ComponentSlot({
    type: ComponentType.Primary,
    subType: ComponentSubType.RangedWeapon,
    x: 6,
    y: 21,
    children: [rangeA8],
    branch: new ComponentBranch({
        parts: [
            {
                direction: ComponentBranchDirection.Vertical,
                x: 7,
                y: 17
            }, {
                direction: ComponentBranchDirection.Vertical,
                x: 7,
                y: 19
            }
        ]
    })
});

var rangeA6 = new ComponentSlot({
    type: ComponentType.OptionalModifier,
    subType: ComponentSubType.Aim,
    x: 18,
    y: 13,
    branch: new ComponentBranch({
        parts: [
            {
                direction: ComponentBranchDirection.Horizontal,
                x: 14,
                y: 14
            }, {
                direction: ComponentBranchDirection.Horizontal,
                x: 16,
                y: 14
            }, {
                direction: ComponentBranchDirection.Horizontal,
                x: 18,
                y: 14
            }
        ]
    })
});

var rangeA5 = new ComponentSlot({
    type: ComponentType.Modal,
    subType: ComponentSubType.Prepare,
    x: 12,
    y: 13,
    children: [rangeA6],
    branch: new ComponentBranch({
        parts: [
            {
                direction: ComponentBranchDirection.Horizontal,
                x: 10,
                y: 14
            }, {
                direction: ComponentBranchDirection.Horizontal,
                x: 12,
                y: 14
            }
        ]
    })
});

var rangeA4 = new ComponentSlot({
    type: ComponentType.Primary,
    subType: ComponentSubType.RangedWeapon,
    x: 6,
    y: 13,
    children: [rangeA5, rangeA7],
    branch: new ComponentBranch({
        parts: [
            {
                direction: ComponentBranchDirection.Vertical,
                x: 7,
                y: 9
            }, {
                direction: ComponentBranchDirection.Vertical,
                x: 7,
                y: 11
            }
        ]
    })
});

var rangeA3 = new ComponentSlot({
    type: ComponentType.OptionalModifier,
    subType: ComponentSubType.Aim,
    x: 18,
    y: 5,
    branch: new ComponentBranch({
        parts: [
            {
                direction: ComponentBranchDirection.Horizontal,
                x: 14,
                y: 6
            }, {
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

var rangeA2 = new ComponentSlot({
    type: ComponentType.Modal,
    subType: ComponentSubType.Prepare,
    x: 12,
    y: 5,
    children: [rangeA3],
    branch: new ComponentBranch({
        parts: [
            {
                direction: ComponentBranchDirection.Horizontal,
                x: 10,
                y: 6
            }, {
                direction: ComponentBranchDirection.Horizontal,
                x: 12,
                y: 6
            }
        ]
    })
});

var rangeA1 = new ComponentSlot({
    type: ComponentType.Primary,
    subType: ComponentSubType.RangedWeapon,
    x: 6,
    y: 5,
    children: [rangeA2, rangeA4]
});

var rangeA = new ComponentNetwork({
    name: RANGE_A_COMPONENT_NETWORK,
    slots: [
        rangeA1, rangeA2, rangeA3, rangeA4, rangeA5,
        rangeA6, rangeA7, rangeA8, rangeA9
    ]
});