/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/// <reference path="../componentConstants.ts" />
/// <reference path="../componentSlot.ts" />
/// <reference path="../componentBranch.ts" />
/// <reference path="../componentNetwork.ts" />

var magic10 = new ComponentSlot({
    type: ComponentType.OptionalModifier,
    subType: ComponentSubType.Range,
    x: 17,
    y: 8,
    branch: new ComponentBranch([
        {
            direction: ComponentBranchDirection.DiagonalLeft,
            x: 17,
            y: 8
        }
    ])
});

var magic9 = new ComponentSlot({
    type: ComponentType.OptionalModifier,
    subType: ComponentSubType.Size,
    x: 17,
    y: 2,
    branch: new ComponentBranch([
        {
            direction: ComponentBranchDirection.DiagonalRight,
            x: 17,
            y: 4
        }
    ])
});

var magic8 = new ComponentSlot({
    type: ComponentType.Secondary,
    subType: ComponentSubType.Shape,
    x: 14,
    y: 5,
    children: [magic9, magic10],
    branch: new ComponentBranch({
        parts: [
            {
                direction: ComponentBranchDirection.Horizontal,
                x: 9,
                y: 6
            }, {
                direction: ComponentBranchDirection.Horizontal,
                x: 11,
                y: 6
            }, {
                direction: ComponentBranchDirection.Horizontal,
                x: 13,
                y: 6
            }
        ]
    })
});

var magic7 = new ComponentSlot({
    type: ComponentType.OptionalModifier,
    subType: ComponentSubType.Infusion,
    x: 0,
    y: 25,
    branch: new ComponentBranch({
        parts: [
            {
                direction: ComponentBranchDirection.Horizontal,
                x: 4,
                y: 26
            }, {
                direction: ComponentBranchDirection.Horizontal,
                x: 2,
                y: 26
            }
        ]
    })
});

var magic6 = new ComponentSlot({
    type: ComponentType.Primary,
    subType: ComponentSubType.Rune,
    x: 6,
    y: 25,
    children: [magic7],
    branch: new ComponentBranch({
        parts: [
            {
                direction: ComponentBranchDirection.Vertical,
                x: 7,
                y: 19
            }, {
                direction: ComponentBranchDirection.Vertical,
                x: 7,
                y: 21
            }, {
                direction: ComponentBranchDirection.Vertical,
                x: 7,
                y: 23
            }, {
                direction: ComponentBranchDirection.Horizontal,
                x: 13,
                y: 10
            }, {
                direction: ComponentBranchDirection.BottomCornerRight,
                x: 15,
                y: 10
            }, {
                direction: ComponentBranchDirection.Vertical,
                x: 15,
                y: 12
            }, {
                direction: ComponentBranchDirection.Vertical,
                x: 15,
                y: 14
            }, {
                direction: ComponentBranchDirection.Vertical,
                x: 15,
                y: 16
            }, {
                direction: ComponentBranchDirection.Vertical,
                x: 15,
                y: 18
            }, {
                direction: ComponentBranchDirection.Vertical,
                x: 15,
                y: 20
            }, {
                direction: ComponentBranchDirection.Vertical,
                x: 15,
                y: 22
            }, {
                direction: ComponentBranchDirection.Vertical,
                x: 15,
                y: 24
            }, {
                direction: ComponentBranchDirection.TopCornerRight,
                x: 15,
                y: 26
            }, {
                direction: ComponentBranchDirection.Horizontal,
                x: 13,
                y: 26
            }, {
                direction: ComponentBranchDirection.Horizontal,
                x: 11,
                y: 26
            }, {
                direction: ComponentBranchDirection.Horizontal,
                x: 9,
                y: 26
            }
        ]
    })
});

var magic5 = new ComponentSlot({
    type: ComponentType.OptionalModifier,
    subType: ComponentSubType.Infusion,
    x: 0,
    y: 15,
    branch: new ComponentBranch({
        parts: [
            {
                direction: ComponentBranchDirection.Horizontal,
                x: 4,
                y: 16
            }, {
                direction: ComponentBranchDirection.Horizontal,
                x: 2,
                y: 16
            }
        ]
    })
});

var magic4 = new ComponentSlot({
    type: ComponentType.Primary,
    subType: ComponentSubType.DeadPrimary, //Rune,
    x: 6,
    y: 15,
    children: [magic5, magic6],
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
            }, {
                direction: ComponentBranchDirection.Vertical,
                x: 7,
                y: 13
            }, {
                direction: ComponentBranchDirection.Vertical,
                x: 11,
                y: 10
            }, {
                direction: ComponentBranchDirection.Vertical,
                x: 11,
                y: 12
            }, {
                direction: ComponentBranchDirection.Vertical,
                x: 11,
                y: 14
            }, {
                direction: ComponentBranchDirection.TopCornerRight,
                x: 11,
                y: 16
            }, {
                direction: ComponentBranchDirection.Horizontal,
                x: 9,
                y: 16
            }
        ]
    })
});

var magic3 = new ComponentSlot({
    type: ComponentType.OptionalModifier,
    subType: ComponentSubType.Focus,
    x: 10,
    y: 9,
    children: [magic4, magic6],
    branch: new ComponentBranch({
        parts: [
            {
                direction: ComponentBranchDirection.DiagonalLeft,
                x: 9,
                y: 8
            }, {
                direction: ComponentBranchDirection.DiagonalLeft,
                x: 10,
                y: 9
            }
        ]
    })
});

var magic2 = new ComponentSlot({
    type: ComponentType.OptionalModifier,
    subType: ComponentSubType.Infusion,
    x: 0,
    y: 5,
    branch: new ComponentBranch({
        parts: [
            {
                direction: ComponentBranchDirection.Horizontal,
                x: 4,
                y: 6
            }, {
                direction: ComponentBranchDirection.Horizontal,
                x: 2,
                y: 6
            }
        ]
    })
});

var magic1 = new ComponentSlot({
    type: ComponentType.Modal,
    subType: ComponentSubType.Transposition,
    x: 6,
    y: 0
});

var magic0 = new ComponentSlot({
    type: ComponentType.Primary,
    subType: ComponentSubType.Rune,
    x: 6,
    y: 5,
    children: [magic1, magic2, magic3, magic4, magic8]
});

var magic = new ComponentNetwork({
    name: MAGIC_COMPONENT_NETWORK,
    slots: [
        magic0, magic1, magic2, magic3, magic4, magic5,
        magic6, magic7, magic8, magic9, magic10
    ]
});