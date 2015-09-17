/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/// <reference path="../ability-crafting/componentConstants.ts" />
/// <reference path="../ability-crafting/component.ts" />
/// <reference path="../ability-crafting/componentSlot.ts" />
/// <reference path="../ability-crafting/componentBranch.ts" />
/// <reference path="../ability-crafting/componentNetwork.ts" />

var f1Slot = new ComponentSlot({
    type: ComponentType.OptionalModifier,
    subType: ComponentSubType.None,
    x: 5,
    y: 15,
    branch: new ComponentBranch({
        parts: [
            {
                direction: ComponentBranchDirection.Vertical,
                x: 6,
                y: 14
            }
        ]
    })
});

f1Slot.component = new Component({
    name: 'F1',
    type: ComponentType.OptionalModifier,
    subType: ComponentSubType.None,
    icon: '../images/components/optional-modifier-aim.png',
    slot: f1Slot
});

var e1Slot = new ComponentSlot({
    type: ComponentType.Modal,
    subType: ComponentSubType.None,
    x: 0,
    y: 15,
    branch: new ComponentBranch({
        parts: [
            {
                direction: ComponentBranchDirection.Vertical,
                x: 1,
                y: 9
            }, {
                direction: ComponentBranchDirection.Vertical,
                x: 1,
                y: 11
            }, {
                direction: ComponentBranchDirection.Vertical,
                x: 1,
                y: 13
            }, {
                direction: ComponentBranchDirection.Vertical,
                x: 1,
                y: 15
            }
        ]
    })
});

e1Slot.component = new Component({
    name: 'E1',
    type: ComponentType.Modal,
    subType: ComponentSubType.None,
    path: ComponentPath['Path 1'],
    rank: 2,
    icon: '../images/components/independant-modal-stance.png',
    slot: e1Slot
});

var d1Slot = new ComponentSlot({
    type: ComponentType.Modal,
    subType: ComponentSubType.None,
    x: 5,
    y: 10,
    children: [f1Slot],
    branch: new ComponentBranch({
        parts: [
            {
                direction: ComponentBranchDirection.Vertical,
                x: 6,
                y: 8
            }, {
                direction: ComponentBranchDirection.Vertical,
                x: 6,
                y: 10
            }
        ]
    })
});

d1Slot.component = new Component({
    name: 'D1',
    type: ComponentType.Modal,
    subType: ComponentSubType.None,
    icon: '../images/components/special-modal-draw.png',
    slot: d1Slot
});

var c1Slot = new ComponentSlot({
    type: ComponentType.OptionalModifier,
    subType: ComponentSubType.None,
    x: 5,
    y: 5,
    children: [d1Slot],
    branch: new ComponentBranch({
        parts: [
            {
                direction: ComponentBranchDirection.Vertical,
                x: 6,
                y: 4
            }
        ]
    })
});

c1Slot.component = new Component({
    name: 'C1',
    type: ComponentType.OptionalModifier,
    subType: ComponentSubType.None,
    icon: '../images/components/optional-modifier-aim.png',
    slot: c1Slot
});

var b1Slot = new ComponentSlot({
    type: ComponentType.Secondary,
    subType: ComponentSubType.None,
    x: 0,
    y: 5,
    children: [e1Slot],
    branch: new ComponentBranch({
        parts: [
            {
                direction: ComponentBranchDirection.Horizontal,
                x: 3,
                y: 1
            }, {
                direction: ComponentBranchDirection.BottomCornerLeft,
                x: 1,
                y: 1
            }, {
                direction: ComponentBranchDirection.Vertical,
                x: 1,
                y: 3
            }
        ]
    })
});

b1Slot.component = new Component({
    name: 'B1',
    type: ComponentType.Secondary,
    subType: ComponentSubType.None,
    icon: '../images/components/secondary-style.png',
    slot: b1Slot
});

var a1Slot = new ComponentSlot({
    type: ComponentType.Primary,
    subType: ComponentSubType.Rune,
    x: 5,
    y: 0,
    children: [b1Slot, c1Slot]
});

a1Slot.component = new Component({
    name: 'A1',
    type: ComponentType.Primary,
    subType: ComponentSubType.Rune,
    path: ComponentPath['Path 1'],
    rank: 1,
    icon: '../images/components/primary-weapon.png',
    slot: a1Slot
});

var network1 = new ComponentNetwork({
    slots: [a1Slot, b1Slot, c1Slot, d1Slot, e1Slot, f1Slot]
});