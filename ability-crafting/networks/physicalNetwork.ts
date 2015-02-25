/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/// <reference path="../componentConstants.ts" />
/// <reference path="../componentSlot.ts" />
/// <reference path="../componentBranch.ts" />
/// <reference path="../componentNetwork.ts" />

var physical27 = new ComponentSlot({
    type: ComponentType.OptionalModifier,
    subType: ComponentSubType.Target,
    x: 25,
    y: 18,
    branch: new ComponentBranch({
        parts: [
            {
                direction: ComponentBranchDirection.DiagonalLeft,
                x: 25,
                y: 18
            }
        ]
    })
});

var physical26 = new ComponentSlot({
    type: ComponentType.OptionalModifier,
    subType: ComponentSubType.Potential,
    x: 22,
    y: 20,
    branch: new ComponentBranch({
        parts: [
            {
                direction: ComponentBranchDirection.Vertical,
                x: 23,
                y: 19
            }
        ]
    })
});

var physical25 = new ComponentSlot({
    type: ComponentType.OptionalModifier,
    subType: ComponentSubType.Speed,
    x: 19,
    y: 18,
    branch: new ComponentBranch({
        parts: [
            {
                direction: ComponentBranchDirection.DiagonalRight,
                x: 21,
                y: 18
            }
        ]
    })
});

var physical24 = new ComponentSlot({
    type: ComponentType.OptionalModifier,
    subType: ComponentSubType.Target,
    x: 33,
    y: 2,
    branch: new ComponentBranch({
        parts: [
            {
                direction: ComponentBranchDirection.DiagonalRight,
                x: 33,
                y: 4
            }
        ]
    })
});

var physical23 = new ComponentSlot({
    type: ComponentType.OptionalModifier,
    subType: ComponentSubType.Potential,
    x: 30,
    y: 0,
    branch: new ComponentBranch({
        parts: [
            {
                direction: ComponentBranchDirection.Vertical,
                x: 31,
                y: 3
            }
        ]
    })
});

var physical22 = new ComponentSlot({
    type: ComponentType.OptionalModifier,
    subType: ComponentSubType.Speed,
    x: 27,
    y: 2,
    branch: new ComponentBranch({
        parts: [
            {
                direction: ComponentBranchDirection.DiagonalLeft,
                x: 29,
                y: 4
            }
        ]
    })
});

var physical21 = new ComponentSlot({
    type: ComponentType.Secondary,
    subType: ComponentSubType.Style,
    x: 30,
    y: 5,
    children: [physical22, physical23, physical24],
    branch: new ComponentBranch({
        parts: [
            {
                direction: ComponentBranchDirection.Horizontal,
                x: 26,
                y: 6
            }, {
                direction: ComponentBranchDirection.Horizontal,
                x: 28,
                y: 6
            }
        ]
    })
});

var physical20 = new ComponentSlot({
    type: ComponentType.Secondary,
    subType: ComponentSubType.Style,
    x: 22,
    y: 15,
    children: [physical25, physical26, physical27],
    branch: new ComponentBranch({
        parts: [
            {
                direction: ComponentBranchDirection.Horizontal,
                x: 18,
                y: 16
            }, {
                direction: ComponentBranchDirection.Horizontal,
                x: 20,
                y: 16
            }
        ]
    })
});

var physical19 = new ComponentSlot({
    type: ComponentType.OptionalModifier,
    subType: ComponentSubType.Target,
    x: 25,
    y: 8,
    branch: new ComponentBranch({
        parts: [
            {
                direction: ComponentBranchDirection.DiagonalLeft,
                x: 25,
                y: 8
            }
        ]
    })
});

var physical18 = new ComponentSlot({
    type: ComponentType.OptionalModifier,
    subType: ComponentSubType.Potential,
    x: 22,
    y: 10,
    branch: new ComponentBranch({
        parts: [
            {
                direction: ComponentBranchDirection.Vertical,
                x: 23,
                y: 9
            }
        ]
    })
});

var physical17 = new ComponentSlot({
    type: ComponentType.OptionalModifier,
    subType: ComponentSubType.Speed,
    x: 19,
    y: 8,
    branch: new ComponentBranch({
        parts: [
            {
                direction: ComponentBranchDirection.DiagonalRight,
                x: 21,
                y: 8
            }
        ]
    })
});

var physical16 = new ComponentSlot({
    type: ComponentType.OptionalModifier,
    subType: ComponentSubType.Target,
    x: 17,
    y: 22,
    branch: new ComponentBranch({
        parts: [
            {
                direction: ComponentBranchDirection.DiagonalRight,
                x: 17,
                y: 24
            }
        ]
    })
});

var physical15 = new ComponentSlot({
    type: ComponentType.OptionalModifier,
    subType: ComponentSubType.Potential,
    x: 14,
    y: 20,
    branch: new ComponentBranch({
        parts: [
            {
                direction: ComponentBranchDirection.Vertical,
                x: 15,
                y: 23
            }
        ]
    })
});

var physical14 = new ComponentSlot({
    type: ComponentType.OptionalModifier,
    subType: ComponentSubType.Speed,
    x: 11,
    y: 22,
    branch: new ComponentBranch({
        parts: [
            {
                direction: ComponentBranchDirection.DiagonalLeft,
                x: 13,
                y: 24
            }
        ]
    })
});

var physical13 = new ComponentSlot({
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

var physical12 = new ComponentSlot({
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

var physical11 = new ComponentSlot({
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

var physical10 = new ComponentSlot({
    type: ComponentType.Secondary,
    subType: ComponentSubType.Style,
    x: 14,
    y: 25,
    children: [physical14, physical15, physical16],
    branch: new ComponentBranch({
        parts: [
            {
                direction: ComponentBranchDirection.Horizontal,
                x: 10,
                y: 26
            }, {
                direction: ComponentBranchDirection.Horizontal,
                x: 12,
                y: 26
            }
        ]
    })
});

var physical9 = new ComponentSlot({
    type: ComponentType.Secondary,
    subType: ComponentSubType.DeadSecondary,
    x: 22,
    y: 5,
    children: [physical17, physical18, physical19, physical21],
    branch: new ComponentBranch({
        parts: [
            {
                direction: ComponentBranchDirection.Horizontal,
                x: 18,
                y: 6
            }, {
                direction: ComponentBranchDirection.Horizontal,
                x: 20,
                y: 6
            }
        ]
    })
});

var physical8 = new ComponentSlot({
    type: ComponentType.Secondary,
    subType: ComponentSubType.Style,
    x: 14,
    y: 15,
    children: [physical11, physical12, physical13, physical20],
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

var physical7 = new ComponentSlot({
    type: ComponentType.Primary,
    subType: ComponentSubType.Weapon,
    x: 6,
    y: 25,
    children: [physical10],
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
            }
        ]
    })
});

var physical6 = new ComponentSlot({
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

var physical5 = new ComponentSlot({
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

var physical4 = new ComponentSlot({
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

var physical3 = new ComponentSlot({
    type: ComponentType.Primary,
    subType: ComponentSubType.DeadPrimary,
    x: 6,
    y: 15,
    children: [physical7, physical8],
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

var physical2 = new ComponentSlot({
    type: ComponentType.Secondary,
    subType: ComponentSubType.Style,
    x: 14,
    y: 5,
    children: [physical4, physical5, physical6, physical9],
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

var physical1 = new ComponentSlot({
    type: ComponentType.Primary,
    subType: ComponentSubType.Weapon,
    x: 6,
    y: 5,
    children: [physical2, physical3]
});

var physical0 = new ComponentSlot({
    type: ComponentType.IndependantModal,
    subType: ComponentSubType.Stance,
    x: 6,
    y: 0
});

var physical = new ComponentNetwork({
    name: PHYSICAL_COMPONENT_NETWORK,
    slots: [
        physical0, physical1, physical2, physical3, physical4,
        physical5, physical6, physical7, physical8, physical9,
        physical10, physical11, physical12, physical13, physical14,
        physical15, physical16, physical17, physical18, physical19,
        physical20, physical21, physical22, physical23, physical24,
        physical25, physical26, physical27
    ]
});