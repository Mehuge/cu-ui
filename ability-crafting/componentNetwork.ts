/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

class ComponentNetwork {
    name: string;
    slots: Array<ComponentSlot>;
    $network: JQuery;

    constructor(options) {
        if (!options) options = {};
        this.name = options.name;
        this.slots = options.slots || [];
    }

    public createElement() {
        if (this.$network) return this;

        var $network = this.$network = $('<div>').addClass('component-network');

        var maxX = 0, maxY = 0;

        this.slots.forEach(slot => {
            if (slot.branch) slot.branch.createElement().appendTo($network);

            if (slot.x > maxX) maxX = slot.x;
            if (slot.y > maxY) maxY = slot.y;

            slot.createElement().appendTo($network);

            if (slot.component) {
                slot.component.slot.x = slot.x;
                slot.component.slot.y = slot.y;
                slot.component.createElement().appendTo($network);
            }
        });

        $network.css({
            width: maxX * GRID_CELL_WIDTH + COMPONENT_WIDTH,
            height: maxY * GRID_CELL_HEIGHT + COMPONENT_HEIGHT
        });

        return this;
    }

    public updateElement() {
        if (!this.$network) return this;

        var maxX = 0, maxY = 0;

        this.slots.forEach(slot => {
            if (slot.x > maxX) maxX = slot.x;
            if (slot.y > maxY) maxY = slot.y;
        });

        this.$network.css({
            width: maxX * GRID_CELL_WIDTH + COMPONENT_WIDTH,
            height: maxY * GRID_CELL_HEIGHT + COMPONENT_HEIGHT
        });

        return this;
    }

    public appendTo(target) {
        if (this.$network) this.$network.appendTo(target);
        return this;
    }

    public hide() {
        this.slots.forEach(slot => {
            slot.hide();
        });
        return this;
    }

    public hideNonRootComponentSlots() {
        this.slots.forEach(slot => {
            if (slot.parents && slot.parents.length) slot.hide();
        });
        return this;
    }

    public hasAllComponentSlots(components) {
        var slots = this.slots.slice(0);
        return components.filter(component => {
            if (!component || !component.slot ||
                !_.isNumber(component.slot.x) || !_.isNumber(component.slot.y) ||
                !_.isNumber(component.slot.type) || !_.isNumber(component.slot.subType)) return false;
            var slot;
            for (var i = 0, length = slots.length; i < length; i++) {
                slot = slots[i];
                if ((component.slot.subType === ComponentSubType.None && slot.type === component.slot.type) ||
                    (slot.x === component.slot.x && slot.y === component.slot.y &&
                    slot.type === component.slot.type && slot.subType === component.slot.subType)) {
                    slots.splice(i, 1);
                    return true;
                }
            }
            return false;
        }).length === components.length;
    }

    public hasAnyCompatibleSlot(component) {
        if (!component || !component.slot) return false;
        return _.any(this.slots, s => s.isSameType(component.type) &&
            s.hasSubType(component.subType) &&
            s.isSameDepth(component.slot.depth())); /* &&
            s.isSameLocation(component.slot.x, component.slot.y));*/
    }

    public remove() {
        var promises = [];
        this.slots.forEach(slot => { promises.push(slot.remove()); });
        return new Promise((resolve, reject) => {
            Promise.all(promises).then(() => {
                if (this.$network) this.$network.remove().promise().then(resolve, reject);
                else resolve();
            }, reject);
        });
    }

    public clone() {
        var slots = [];

        this.slots.forEach(slot => {
            var isCloned = _.any(slots, s => s.isSameSlot(slot));

            if (!isCloned) {
                slots.push(slot.clone(slots));
            }
        });

        return new ComponentNetwork({
            name: this.name,
            slots: slots
        });
    }

    public merge(network: ComponentNetwork) {
        var slots = [];

        var thisSlots = this.slots.slice(0);
        var thatSlots = network.slots.slice(0);

        var thisSlot, thatSlot;
        for (var i = thisSlots.length - 1; i >= 0; i--) {
            thisSlot = thisSlots[i];

            for (var j = thatSlots.length - 1; j >= 0; j--) {
                thatSlot = thatSlots[j];

                if (!thisSlot.isSameType(thatSlot.type) ||
                    //!thisSlot.hasSubType(thatSlot.subType) ||
                    !thisSlot.isSameDepth(thatSlot.depth())) continue;
                // !thisSlot.isSameLocation(thatSlot.x, thatSlot.y)

                thisSlot.subType = thisSlot.subType | thatSlot.subType;

                slots.push(thisSlot);

                thisSlots.splice(i, 1);
                thatSlots.splice(j, 1);

                break;
            }
        }

        return new ComponentNetwork({
            name: this.name + ' ' + network.name,
            slots: slots.concat(thisSlots).concat(thatSlots)
        });
    }

    public getRootComponentSlots() {
        return this.slots.filter(slot => !slot.parents || !slot.parents.length);
    }

    public hasMatchingComponentSlots(slots) {
        if (!slots || !slots.length) return false;

        var rootSlots = this.getRootComponentSlots();

        var slot;

        for (var slotIndex = 0, slotsLength = slots.length; slotIndex < slotsLength; slotIndex++) {
            slot = slots[slotIndex];

            var matchingRootSlots = rootSlots.filter(s => s.isSameType(slot.type) && s.isSameSubType(slot.subType));

            var matchingRootSlotsLength = matchingRootSlots.length;

            if (matchingRootSlotsLength < 1) return false;

            var hasMatchingChildren = false;

            var matchingRootSlot;

            for (var matchingRootSlotIndex = 0; matchingRootSlotIndex < matchingRootSlotsLength; matchingRootSlotIndex++) {
                matchingRootSlot = matchingRootSlots[matchingRootSlotIndex];

                if (!matchingRootSlot.hasMatchingChildren(slot)) continue;

                hasMatchingChildren = true;

                var rootSlotIndex = rootSlots.indexOf(matchingRootSlot);

                if (rootSlotIndex >= 0) {
                    rootSlots.splice(rootSlotIndex, 1);
                }

                break;
            }

            if (!hasMatchingChildren) return false;
        }

        return true;
    }
}
