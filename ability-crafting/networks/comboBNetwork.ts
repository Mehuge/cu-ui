/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/// <reference path="../componentConstants.ts" />
/// <reference path="../componentSlot.ts" />
/// <reference path="../componentBranch.ts" />
/// <reference path="../componentNetwork.ts" />

var comboB10 = new ComponentSlot({
    type: ComponentType.OptionalModifier,
    subType: ComponentSubType.Target,
    x: 17,
    y: 12,
    branch: new ComponentBranch({
        parts: [
            {
                direction: ComponentBranchDirection.DiagonalRight,
                x: 17,
                y: 14
            }
        ]
    })
});

var comboB9 = new ComponentSlot({
    type: ComponentType.OptionalModifier,
    subType: ComponentSubType.Potential,
    x: 14,
    y: 10,
    branch: new ComponentBranch({
        parts: [
            {
                direction: ComponentBranchDirection.Vertical,
                x: 15,
                y: 13
            }
        ]
    })
});

var comboB8 = new ComponentSlot({
    type: ComponentType.OptionalModifier,
    subType: ComponentSubType.Speed,
    x: 11,
    y: 12,
    branch: new ComponentBranch({
        parts: [
            {
                direction: ComponentBranchDirection.DiagonalLeft,
                x: 13,
                y: 14
            }
        ]
    })
});

var comboB7 = new ComponentSlot({
    type: ComponentType.OptionalModifier,
    subType: ComponentSubType.Range,
    x: 17,
    y: 8,
    branch: new ComponentBranch({
        parts: [
            {
                direction: ComponentBranchDirection.DiagonalLeft,
                x: 17,
                y: 8
            }
        ]
    })
});

var comboB6 = new ComponentSlot({
    type: ComponentType.OptionalModifier,
    subType: ComponentSubType.Size,
    x: 17,
    y: 2,
    branch: new ComponentBranch({
        parts: [
            {
                direction: ComponentBranchDirection.DiagonalRight,
                x: 17,
                y: 4
            }
        ]
    })
});

var comboB5 = new ComponentSlot({
    type: ComponentType.OptionalModifier,
    subType: ComponentSubType.Infusion,
    x: 6,
    y: 25,
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
                direction: ComponentBranchDirection.Vertical,
                x: 7,
                y: 25
            }
        ]
    })
});

var comboB4 = new ComponentSlot({
    type: ComponentType.Secondary,
    subType: ComponentSubType.Style,
    x: 14,
    y: 15,
    children: [comboB8, comboB9, comboB10],
    branch: new ComponentBranch({
        parts: [
            {
                direction: ComponentBranchDirection.Horizontal,
                x: 10,
                y: 16
            }, {
                direction: ComponentBranchDirection.Horizontal,
                x: 12,
                y: 16
            }
        ]
    })
});

var comboB3 = new ComponentSlot({
    type: ComponentType.Primary,
    subType: ComponentSubType.Weapon,
    x: 6,
    y: 15,
    children: [comboB4, comboB5],
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
            }
        ]
    })
});

var comboB2 = new ComponentSlot({
    type: ComponentType.Secondary,
    subType: ComponentSubType.Shape,
    x: 14,
    y: 5,
    children: [comboB6, comboB7],
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

var comboB1 = new ComponentSlot({
    type: ComponentType.Primary,
    subType: ComponentSubType.Rune,
    x: 6,
    y: 5,
    children: [comboB2, comboB3]
});

var comboB = new ComponentNetwork({
    name: COMBO_B_COMPONENT_NETWORK,
    slots: [
        comboB1, comboB2, comboB3, comboB4, comboB5,
        comboB6, comboB7, comboB8, comboB9, comboB10
    ]
});