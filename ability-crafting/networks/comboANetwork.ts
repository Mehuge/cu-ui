/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/// <reference path="../componentConstants.ts" />
/// <reference path="../componentSlot.ts" />
/// <reference path="../componentBranch.ts" />
/// <reference path="../componentNetwork.ts" />

var comboA10 = new ComponentSlot({
    type: ComponentType.OptionalModifier,
    subType: ComponentSubType.Target,
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

var comboA9 = new ComponentSlot({
    type: ComponentType.OptionalModifier,
    subType: ComponentSubType.Potential,
    x: 14,
    y: 0,
    branch: new ComponentBranch({
        parts: [
            {
                direction: ComponentBranchDirection.Vertical,
                x: 15,
                y: 3
            }
        ]
    })
});

var comboA8 = new ComponentSlot({
    type: ComponentType.OptionalModifier,
    subType: ComponentSubType.Speed,
    x: 11,
    y: 2,
    branch: new ComponentBranch({
        parts: [
            {
                direction: ComponentBranchDirection.DiagonalLeft,
                x: 13,
                y: 4
            }
        ]
    })
});

var comboA7 = new ComponentSlot({
    type: ComponentType.OptionalModifier,
    subType: ComponentSubType.Range,
    x: 17,
    y: 18,
    branch: new ComponentBranch({
        parts: [
            {
                direction: ComponentBranchDirection.DiagonalLeft,
                x: 17,
                y: 18
            }
        ]
    })
});

var comboA6 = new ComponentSlot({
    type: ComponentType.OptionalModifier,
    subType: ComponentSubType.Size,
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

var comboA5 = new ComponentSlot({
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

var comboA4 = new ComponentSlot({
    type: ComponentType.Secondary,
    subType: ComponentSubType.DeadSecondary,
    x: 14,
    y: 15,
    children: [comboA6, comboA7],
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

var comboA3 = new ComponentSlot({
    type: ComponentType.Primary,
    subType: ComponentSubType.DeadPrimary,
    x: 6,
    y: 15,
    children: [comboA4, comboA5],
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

var comboA2 = new ComponentSlot({
    type: ComponentType.Secondary,
    subType: ComponentSubType.Style,
    x: 14,
    y: 5,
    children: [comboA8, comboA9, comboA10],
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

var comboA1 = new ComponentSlot({
    type: ComponentType.Primary,
    subType: ComponentSubType.Weapon,
    x: 6,
    y: 5,
    children: [comboA2, comboA3]
});

var comboA = new ComponentNetwork({
    name: COMBO_A_COMPONENT_NETWORK,
    slots: [
        comboA1, comboA2, comboA3, comboA4, comboA5,
        comboA6, comboA7, comboA8, comboA9, comboA10
    ]
});