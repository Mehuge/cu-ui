/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/// <reference path="../componentConstants.ts" />
/// <reference path="../componentSlot.ts" />
/// <reference path="../componentBranch.ts" />
/// <reference path="../componentNetwork.ts" />

var rangeB12 = new ComponentSlot({
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
            }, {
                direction: ComponentBranchDirection.DiagonalRight,
                x: 18,
                y: 24
            }, {
                direction: ComponentBranchDirection.DiagonalRight,
                x: 17,
                y: 25
            }
        ]
    })
});

var rangeB11 = new ComponentSlot({
    type: ComponentType.Modal,
    subType: ComponentSubType.Load,
    x: 15,
    y: 25,
    children: [rangeB12],
    branch: new ComponentBranch({
        parts: [
            {
                direction: ComponentBranchDirection.DiagonalLeft,
                x: 14,
                y: 24
            }
        ]
    })
});

var rangeB10 = new ComponentSlot({
    type: ComponentType.Modal,
    subType: ComponentSubType.Draw,
    x: 12,
    y: 21,
    children: [rangeB11, rangeB12],
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

var rangeB9 = new ComponentSlot({
    type: ComponentType.Primary,
    subType: ComponentSubType.RangedWeapon,
    x: 6,
    y: 21,
    children: [rangeB10],
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

var rangeB8 = new ComponentSlot({
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
            }, {
                direction: ComponentBranchDirection.DiagonalRight,
                x: 18,
                y: 16
            }, {
                direction: ComponentBranchDirection.DiagonalRight,
                x: 17,
                y: 17
            }
        ]
    })
});

var rangeB7 = new ComponentSlot({
    type: ComponentType.Modal,
    subType: ComponentSubType.Load,
    x: 15,
    y: 17,
    children: [rangeB8],
    branch: new ComponentBranch({
        parts: [
            {
                direction: ComponentBranchDirection.DiagonalLeft,
                x: 14,
                y: 16
            }
        ]
    })
});

var rangeB6 = new ComponentSlot({
    type: ComponentType.Modal,
    subType: ComponentSubType.Draw,
    x: 12,
    y: 13,
    children: [rangeB7, rangeB8],
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

var rangeB5 = new ComponentSlot({
    type: ComponentType.Primary,
    subType: ComponentSubType.RangedWeapon,
    x: 6,
    y: 13,
    children: [rangeB6, rangeB9],
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

var rangeB4 = new ComponentSlot({
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
            }, {
                direction: ComponentBranchDirection.DiagonalRight,
                x: 18,
                y: 8
            }, {
                direction: ComponentBranchDirection.DiagonalRight,
                x: 17,
                y: 9
            }
        ]
    })
});

var rangeB3 = new ComponentSlot({
    type: ComponentType.Modal,
    subType: ComponentSubType.Load,
    x: 15,
    y: 9,
    children: [rangeB4],
    branch: new ComponentBranch({
        parts: [
            {
                direction: ComponentBranchDirection.DiagonalLeft,
                x: 14,
                y: 8
            }
        ]
    })
});

var rangeB2 = new ComponentSlot({
    type: ComponentType.Modal,
    subType: ComponentSubType.Draw,
    x: 12,
    y: 5,
    children: [rangeB3, rangeB4],
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

var rangeB1 = new ComponentSlot({
    type: ComponentType.Primary,
    subType: ComponentSubType.RangedWeapon,
    x: 6,
    y: 5,
    children: [rangeB2, rangeB5]
});

var rangeB = new ComponentNetwork({
    name: RANGE_B_COMPONENT_NETWORK,
    slots: [
        rangeB1, rangeB2, rangeB3, rangeB4, rangeB5, rangeB6,
        rangeB7, rangeB8, rangeB9, rangeB10, rangeB11, rangeB12
    ]
});