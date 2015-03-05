/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/// <reference path="../vendor/jquery.d.ts" />
/// <reference path="../cu/cu.ts" />

class ComponentSlot {
    type: ComponentType;
    subType: ComponentSubType;
    x: number;
    y: number;
    parents: Array<ComponentSlot>;
    children: Array<ComponentSlot>;
    branch: ComponentBranch;
    component: Component;
    isDisabled: boolean;

    tooltip: Tooltip;

    originalSubType: ComponentSubType;
    queuedAnimation: string;

    $slot: JQuery;

    constructor(options) {
        if (!options) options = {};

        if (!_.isNumber(options.type)) throw new Error('type required');
        if (!_.isNumber(options.subType)) throw new Error('subType required');

        this.type = options.type;
        this.subType = options.subType;
        if (_.isNumber(options.x)) this.x = options.x;
        if (_.isNumber(options.y)) this.y = options.y;
        this.parents = options.parents || [];
        this.children = options.children || [];
        if (options.branch) this.branch = options.branch;
        if (options.component) this.component = options.component;
        this.isDisabled = options.isDisabled || false;
        this.children.forEach(child => {
            child.addParent(this);
        });
    }

    public createElement() {
        if (this.$slot) return this;

        var typeName = ComponentType[this.type];
        var typeCssClass = typeName.replace(/([A-Z])/g, '-$1').replace(/^-/, '').toLowerCase();

        if (!_.isNumber(this.x)) throw new Error('x required');
        if (!_.isNumber(this.y)) throw new Error('y required');

        var $slot = this.$slot = $('<div>').addClass('component-slot ' + typeCssClass);

        this.tooltip = new Tooltip($slot, {
            showDelay: 500,
            hideDelay: 200,
            title: this.component ? this.component.name : '',
            content: this.component ? this.component.createTooltip() : null,
            left: e => e.clientX + 10,
            top: e => e.clientY + 10
        });

        return this.updateElement();
    }

    public updateElement() {
        var hasComponent = this.hasComponent();

        if (this.$slot) {
            this.$slot.css({
                'left': this.x * GRID_CELL_WIDTH,
                'top': this.y * GRID_CELL_HEIGHT
            });

            this.$slot[this.isDisabled ? 'addClass' : 'removeClass']('disabled');
            this.$slot[!hasComponent ? 'addClass' : 'removeClass']('empty');
            this.$slot[hasComponent && this.component.isTrained ? 'addClass' : 'removeClass']('trained');
        }

        if (this.branch) {
            var branchState = ComponentBranchState.Disabled;
            if (!this.isDisabled && this.allParentsHaveComponents()) {
                if (hasComponent) {
                    branchState = ComponentBranchState.Slotted;
                } else {
                    branchState = ComponentBranchState.Open;
                }
            }

            this.branch.state = branchState;
            this.branch.updateElement();
        }

        return this.bindEvents();
    }

    public bindEvents() {
        var self = this;

        if (this.tooltip) {
            this.tooltip.bindEvents();
        }

        if (this.$slot) {
            this.$slot.off('mousemove').on('mousemove', e => {
                e.preventDefault();
                e.stopPropagation();

                if (self.tooltip) {
                    self.tooltip.move(e.clientX + 10, e.clientY + 10);
                }

                return false;
            });
        }

        return this;
    }

    public appendTo(target) {
        if (this.$slot) this.$slot.appendTo(target);
        return this;
    }

    public parent() {
        if (this.$slot) return this.$slot.parent();
        return null;
    }

    public on(events, handler) {
        if (this.$slot) {
            this.$slot.on(events, e => {
                var result = handler.apply(this, arguments);
                if (result && !e.isTrigger && this.component) this.component.trigger(e.type, arguments);
            });
        }
        return this;
    }

    public off() {
        if (this.$slot) this.$slot.off.apply(this.$slot, arguments);
        return this;
    }

    public trigger(eventType, extraParameters) {
        if (this.$slot) this.$slot.trigger(eventType, extraParameters);
        return this;
    }

    public addParent(parent) {
        this.parents.push(parent);
        return this;
    }

    public addChild(child) {
        this.children.push(child);
        return this;
    }

    public setComponent(component) {
        if (this.component === component) return this;

        this.component = component;

        if (this.$slot) this.$slot[this.hasComponent() ? 'removeClass' : 'addClass']('empty');

        return this;
    }

    public hasComponent() {
        return !_.isUndefined(this.component);
    }

    public remove() {
        return this.tryPlayQueuedAnimation();
    }

    public hide() {
        var promises = [];
        if (this.$slot) promises.push(this.$slot.stop().hide().promise());
        if (this.branch) promises.push(this.branch.hide());
        if (this.component) promises.push(this.component.hide());
        return Promise.all(promises);
    }

    public show() {
        var promises = [];
        if (this.$slot) promises.push(this.$slot.stop().show().promise());
        if (this.branch) promises.push(this.branch.show());
        if (this.component) promises.push(this.component.show());
        return Promise.all(promises);
    }

    public fadeIn() {
        var promises = [];
        if (this.$slot) promises.push(this.$slot.stop().fadeIn().promise());
        if (this.branch) promises.push(this.branch.fadeIn());
        if (this.component) promises.push(this.component.fadeIn());
        return Promise.all(promises);
    }

    public fadeOut() {
        var promises = [];
        if (this.$slot) promises.push(this.$slot.stop().fadeOut().promise());
        if (this.branch) promises.push(this.branch.fadeOut());
        if (this.component) promises.push(this.component.fadeOut());
        return Promise.all(promises);
    }

    public isSameType(type) {
        return this.type === type;
    }

    public isSameSubType(subType) {
        return this.subType === subType;
    }

    public hasSubType(subType) {
        return this.isSameSubType(subType) || this.getSlotSubTypes(this.subType).indexOf(subType) !== -1;
    }

    public hasOriginalSubType(subType) {
        return this.originalSubType && this.getSlotSubTypes(this.originalSubType).indexOf(subType) !== -1;
    }

    public getSlotSubTypes(slotSubType) {
        return ComponentSubTypeValues.filter(subType => (slotSubType & subType) === subType);
    }

    public isSameDepth(depth) {
        return this.depth() === depth;
    }

    public isSameLocation(x, y) {
        return this.x === x && this.y === y;
    }

    public isSameSlot(slot) {
        return this.isSameType(slot.type) && this.hasSubType(slot.subType) &&
            this.isSameDepth(slot.depth()) && this.isSameLocation(slot.x, slot.y);
    }

    public depth() {
        if (!this.parents || !this.parents.length) return 0;
        var depths = this.parents.map(parent => parent.depth());
        return _.max(depths) + 1;
    }

    public isRoot() {
        return this.depth() === 0;
    }

    public clone(clonedSlots) {
        var parents;

        if (clonedSlots) {
            parents = this.parents.map(parent => {
                var clonedSlot = clonedSlots.filter(s => s.isSameType(parent.type) && s.hasSubType(parent.subType) &&
                    s.isSameDepth(parent.depth()) && s.isSameLocation(parent.x, parent.y))[0];

                if (!clonedSlot) {
                    clonedSlot = parent.clone(clonedSlots);
                    clonedSlots.push(clonedSlot);
                }

                return clonedSlot;
            });
        } else {
            parents = [];
        }

        var slot = new ComponentSlot({
            type: this.type,
            subType: this.subType,
            x: this.x,
            y: this.y,
            parents: parents,
            branch: this.branch ? this.branch.clone() : undefined,
            isDisabled: this.isDisabled
        });

        slot.parents.forEach(parent => {
            parent.addChild(slot);
        });

        return slot;
    }

    public setSubType(subType) {
        if (_.isUndefined(this.originalSubType)) this.originalSubType = this.subType;

        this.subType = subType;

        return this;
    }

    public allParentsHaveComponents() {
        return _.all(this.parents, parent => parent.hasComponent());
    }

    public isVisible() {
        return this.$slot && this.$slot.is(':visible');
    }

    public tryPlayQueuedAnimation() {
        var queuedAnimation = this.queuedAnimation;
        if (queuedAnimation) {
            this.queuedAnimation = null;
            return new Promise((resolve, reject) => {
                if (_.isFunction(this[queuedAnimation])) {
                    var promise = this[queuedAnimation]();
                    if (promise instanceof Promise) {
                        promise.then(resolve, reject);
                    } else {
                        resolve();
                    }
                } else {
                    reject();
                }
            });
        }
        return Promise.resolve();
    }

    public hasMatchingChildren(slot) {
        var clonedChildren = this.children.slice(0);

        var childSlots = slot.children;

        var childSlot;

        for (var childSlotIndex = 0, childSlotsLength = childSlots.length; childSlotIndex < childSlotsLength; childSlotIndex++) {
            childSlot = childSlots[childSlotIndex];

            var matchingSlots = clonedChildren.filter(s => s.isSameType(childSlot.type) && s.isSameSubType(childSlot.subType));

            var matchingSlotsLength = matchingSlots.length;

            if (matchingSlotsLength < 1) return false;

            var hasMatchingChildren = false;

            var matchingSlot;

            for (var matchingSlotIndex = 0; matchingSlotIndex < matchingSlotsLength; matchingSlotIndex++) {
                matchingSlot = matchingSlots[matchingSlotIndex];

                if (!matchingSlot.hasMatchingChildren(childSlot)) continue;

                hasMatchingChildren = true;

                var clonedSlotIndex = clonedChildren.indexOf(matchingSlot);

                if (clonedSlotIndex >= 0) {
                    clonedChildren.splice(clonedSlotIndex, 1);
                }

                break;
            }

            if (!hasMatchingChildren) return false;
        }

        return true;
    }
}
