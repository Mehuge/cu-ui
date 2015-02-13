/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/// <reference path="../ability-crafting/componentConstants.ts" />
/// <reference path="../ability-crafting/component.ts" />
/// <reference path="../ability-crafting/componentSlot.ts" />
/// <reference path="../ability-crafting/componentBranch.ts" />
/// <reference path="../ability-crafting/componentNetwork.ts" />

var h2Slot = new ComponentSlot({
  type: ComponentType.Secondary,
  subType: ComponentSubType.None,
  x: 10, y: 15,
  branch: new ComponentBranch({
    parts: [{
      direction: ComponentBranchDirection.Vertical,
      x: 11, y: 13
    }]
  })
});

h2Slot.component = new Component({
  name: 'H2',
  type: ComponentType.Secondary,
  subType: ComponentSubType.None,
  path: ComponentPath['Path 2'],
  rank: 2,
  icon: '../images/components/secondary-style.png',
  slot: h2Slot
});

var g2Slot = new ComponentSlot({
  type: ComponentType.Secondary,
  subType: ComponentSubType.None,
  x: 5, y: 15,
  branch: new ComponentBranch({
    parts: [{
      direction: ComponentBranchDirection.Vertical,
      x: 6, y: 13
    }]
  })
});

g2Slot.component = new Component({
  name: 'G2',
  type: ComponentType.Secondary,
  subType: ComponentSubType.None,
  icon: '../images/components/secondary-style.png',
  slot: g2Slot
});

var f2Slot = new ComponentSlot({
  type: ComponentType.Secondary,
  subType: ComponentSubType.None,
  x: 0, y: 15,
  branch: new ComponentBranch({
    parts: [{
      direction: ComponentBranchDirection.Vertical,
      x: 1, y: 9
    }, {
      direction: ComponentBranchDirection.Vertical,
      x: 1, y: 11
    }, {
      direction: ComponentBranchDirection.Vertical,
      x: 1, y: 13
    }]
  })
});

f2Slot.component = new Component({
  name: 'F2',
  type: ComponentType.Secondary,
  subType: ComponentSubType.None,
  icon: '../images/components/secondary-style.png',
  slot: f2Slot
});

var e2Slot = new ComponentSlot({
  type: ComponentType.Secondary,
  subType: ComponentSubType.None,
  x: 10, y: 10,
  children: [h2Slot],
  branch: new ComponentBranch({
    parts: [{
      direction: ComponentBranchDirection.Horizontal,
      x: 9, y: 6
    }, {
      direction: ComponentBranchDirection.BottomCornerRight,
      x: 11, y: 6
    }, {
      direction: ComponentBranchDirection.Vertical,
      x: 11, y: 8
    }]
  })
});

e2Slot.component = new Component({
  name: 'E2',
  type: ComponentType.Secondary,
  subType: ComponentSubType.None,
  icon: '../images/components/secondary-style.png',
  slot: e2Slot
});

var d2Slot = new ComponentSlot({
  type: ComponentType.Secondary,
  subType: ComponentSubType.None,
  x: 5, y: 10,
  children: [g2Slot],
  branch: new ComponentBranch({
    parts: [{
      direction: ComponentBranchDirection.Vertical,
      x: 6, y: 8
    }]
  })
});

d2Slot.component = new Component({
  name: 'D2',
  type: ComponentType.Secondary,
  subType: ComponentSubType.None,
  icon: '../images/components/secondary-style.png',
  slot: d2Slot
});

var c2Slot = new ComponentSlot({
  type: ComponentType.Secondary,
  subType: ComponentSubType.None,
  x: 5, y: 5,
  children: [d2Slot, e2Slot],
  branch: new ComponentBranch({
    parts: [{
      direction: ComponentBranchDirection.Vertical,
      x: 6, y: 3
    }]
  })
});

c2Slot.component = new Component({
  name: 'C2',
  type: ComponentType.Secondary,
  subType: ComponentSubType.None,
  icon: '../images/components/secondary-style.png',
  slot: c2Slot
});

var b2Slot = new ComponentSlot({
  type: ComponentType.Secondary,
  subType: ComponentSubType.None,
  x: 0, y: 5,
  children: [f2Slot],
  branch: new ComponentBranch({
    parts: [{
      direction: ComponentBranchDirection.Horizontal,
      x: 3, y: 1
    }, {
      direction: ComponentBranchDirection.BottomCornerLeft,
      x: 1, y: 1
    }, {
      direction: ComponentBranchDirection.Vertical,
      x: 1, y: 3
    }]
  })
});

b2Slot.component = new Component({
  name: 'B2',
  type: ComponentType.Secondary,
  subType: ComponentSubType.None,
  icon: '../images/components/secondary-style.png',
  slot: b2Slot
});

var a2Slot = new ComponentSlot({
  type: ComponentType.Secondary,
  subType: ComponentSubType.Shape,
  x: 5, y: 0,
  children: [b2Slot, c2Slot]
});

a2Slot.component = new Component({
  name: 'A2',
  type: ComponentType.Secondary,
  subType: ComponentSubType.Shape,
  path: ComponentPath['Path 2'],
  rank: 1,
  icon: '../images/components/secondary-style.png',
  slot: a2Slot
});

var network2 = new ComponentNetwork({
    slots: [a2Slot, b2Slot, c2Slot, d2Slot, e2Slot, f2Slot, g2Slot, h2Slot]
});