/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/// <reference path="../vendor/promise.d.ts" />

class TagConstraint {
    constructor(public constraintType: TagConstraintType, public tags: Array<AbilityTags>) {}

    public checkConstraints(otherTags: Array<AbilityTags>) {
        if (this.constraintType === TagConstraintType.AllOf &&
            this.tags.filter(tag => { return otherTags.indexOf(tag) === -1; }).length > 0) return false;

        var intersects = _.intersection(this.tags, otherTags).length > 0;
        if (this.constraintType === TagConstraintType.AnyOf && !intersects) return false;
        else if (this.constraintType === TagConstraintType.NoneOf && intersects) return false;

        return true;
    }
}

class Component {
    id: number;
    baseComponentID: number;
    name: string;
    description: string;
    icon: string;
    type: ComponentType;
    subType: ComponentSubType;
    path: ComponentPath;
    stats: Array<any>;
    tags: Array<AbilityTags>;
    tagConstraints: Array<TagConstraint>;
    slot: ComponentSlot;
    rank: number;
    isTrained: boolean;
    isHalted: boolean;

    $component: JQuery;

    constructor(options) {
        if (!options) options = {};

        if (_.isUndefined(options.slot) && (!_.isNumber(options.type) || !_.isNumber(options.subType))) {
            throw new Error('slot or type and subType required');
        }

        this.id = options.id;
        this.baseComponentID = options.baseComponentID;
        this.name = options.name || '';
        this.description = options.description || '';
        this.type = options.type;
        this.subType = options.subType;
        this.icon = options.icon || '';
        this.path = _.isNumber(options.path) ? options.path : -1;
        this.stats = options.stats || [];
        this.tags = options.tags || [];
        this.tagConstraints = options.tagConstraints || [];
        if (options.slot) this.slot = options.slot;
        this.rank = options.rank || 1;
        this.isTrained = options.isTrained || false;
        this.isHalted = options.isHalted || false;
    }

    public createElement() {
        if (this.$component) return this.updateElement();

        var $component = this.$component = $('<div>').addClass('component');

        if (this.icon) {
            $component.css({ 'background': 'url(' + this.icon + ') no-repeat center center', 'background-size': 'contain' });
        }

        return this.updateElement();
    }

    public updateElement() {
        if (!this.$component) return this;

        this.$component[this.isTrained ? 'addClass' : 'removeClass']('trained');

        if (this.slot) {
            if (_.isNumber(this.slot.x)) {
                this.$component.css('left', this.slot.x * GRID_CELL_WIDTH);
            }

            if (_.isNumber(this.slot.y)) {
                this.$component.css('top', this.slot.y * GRID_CELL_HEIGHT);
            }
        }

        return this.bindEvents();
    }

    public bindEvents() {
        return this;
    }

    public appendTo(target) {
        if (this.$component) this.$component.appendTo(target);
        return this;
    }

    public on(events, handler) {
        if (this.$component) {
            this.$component.on(events, e => {
                var result = handler.apply(this, arguments);
                if (result && !e.isTrigger && this.slot) this.slot.trigger(e.type, arguments);
            });
        }
        return this;
    }

    public off() {
        if (this.$component) this.$component.off.apply(this.$component, arguments);
        return this;
    }

    public trigger(eventType, extraParameters) {
        if (this.$component) this.$component.trigger(eventType, extraParameters);
        return this;
    }

    public remove() {
        return this.$component ? this.$component.remove().promise() : Promise.resolve();
    }

    public hide() {
        return this.$component ? this.$component.hide().promise() : Promise.resolve();
    }

    public show() {
        return this.$component ? this.$component.show().promise() : Promise.resolve();
    }

    public fadeIn() {
        return this.$component ? this.$component.fadeIn().promise() : Promise.resolve();
    }

    public fadeOut() {
        return this.$component ? this.$component.fadeOut().promise() : Promise.resolve();
    }
    
    public setSlot(slot) {
        if (this.slot === slot) return this;

        this.slot = slot;

        return this;
    }

    public clone() {
        return new Component(this);
    }

    public createTooltip() {
        var $tooltip = $('<div>').addClass('component-tooltip');

        if (this.description) {
            $('<p>').addClass('component-tooltip-description').html(this.description).appendTo($tooltip);
        }

        if (this.stats && this.stats.length) {
            var $stats = $('<ul>').addClass('component-tooltip-stats').appendTo($tooltip);

            this.stats.forEach(stat => {
                $('<li>').text(stat.name + ': ' + stat.value.toFixed(2)).appendTo($stats);
            });
        }

        if (this.tagConstraints && this.tagConstraints.length) {
            $('<p>').addClass('component-tooltip-requirements-label').text('Requirements:').appendTo($tooltip);

            var $requirements = $('<ul>').addClass('component-tooltip-requirements').appendTo($tooltip);

            this.tagConstraints.forEach(tagConstraint => {
                var constraintType = TagConstraintType[tagConstraint.constraintType].replace(/([A-Z])/g, ' $1').trim();

                var tags = tagConstraint.tags.map(tag => AbilityTags[tag].replace(/([A-Z])/g, ' $1').trim());

                $('<li>').text(constraintType + ': ' + tags.join(', ')).appendTo($requirements);
            });
        }

        return $tooltip;
    }

    public train() {
        return new Promise(resolve => {
            this.isTrained = true;
            this.isHalted = false;
            // TODO: implement on the web api
            resolve();
        });
    }

    public untrain() {
        return new Promise(resolve => {
            this.isTrained = false;
            this.isHalted = false;
            // TODO: implement on the web api
            resolve();
        });
    }

    public halt() {
        return new Promise(resolve => {
            this.isHalted = true;
            // TODO: implement on the web api
            resolve();
        });
    }

    public resume() {
        return new Promise(resolve => {
            this.isHalted = false;
            // TODO: implement on the web api
            resolve();
        });
    }

    public tagCheck(tags: Array<AbilityTags>) {
        for (var i = 0, length = this.tagConstraints.length; i < length; i++) {
            if (!this.tagConstraints[i].checkConstraints(tags)) return false;
        }

        return true;
    }
}
