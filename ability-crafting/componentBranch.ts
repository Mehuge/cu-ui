/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

class ComponentBranch {
    $branch: JQuery;
    parts;
    state: ComponentBranchState;

    constructor(options) {
        if (_.isArray(options)) {
            this.parts = options;
        } else {
            if (!options) options = {};

            if (!_.isArray(options.parts)) throw new Error('parts required');

            this.parts = options.parts;
        }

        this.state = options.state || ComponentBranchState.Disabled;
    }

    public createElement() {
        if (this.$branch) return this;

        var $branch = this.$branch = $('<div>').addClass('component-branch');

        this.parts.forEach(part => {
            if (!_.isNumber(part.direction) || !_.isNumber(part.x) || !_.isNumber(part.y)) return;

            var directionCssClass = ComponentBranchDirection[part.direction].replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();

            part.$part = $('<div>').addClass(directionCssClass).css({
                'left': part.x * GRID_CELL_WIDTH, 'top': part.y * GRID_CELL_HEIGHT
            }).appendTo($branch);
        });

        return this.updateElement();
    }

    public updateElement() {
        if (!this.$branch) return this;

        var stateCssClass = ComponentBranchState[this.state].replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();

        var oldCssClasses = ComponentBranchStateCssClasses.slice(0);

        var index = oldCssClasses.indexOf(stateCssClass);

        if (index !== -1) oldCssClasses.splice(index, 1);

        this.$branch.removeClass(oldCssClasses.join(' ')).addClass(stateCssClass);

        return this;
    }

    public appendTo(target) {
        if (this.$branch) this.$branch.appendTo(target);
        return this;
    }

    public remove() {
        return this.$branch ? this.$branch.remove().promise() : Promise.resolve();
    }

    public hide() {
        var promises = [];
        if (this.$branch) promises.push(this.$branch.stop().hide().promise());
        this.parts.forEach(part => {
            if (part && part.$part) promises.push(part.$part.stop().hide().promise());
        });
        return Promise.all(promises);
    }

    public show() {
        var promises = [];
        if (this.$branch) promises.push(this.$branch.stop().show().promise());
        this.parts.forEach(part => {
            if (part && part.$part) promises.push(part.$part.stop().show().promise());
        });
        return Promise.all(promises);
    }

    public fadeIn() {
        var promises = [];
        if (this.$branch) promises.push(this.$branch.stop().fadeIn().promise());
        this.parts.forEach(part => {
            if (part && part.$part) promises.push(part.$part.stop().fadeIn().promise());
        });
        return Promise.all(promises);
    }

    public fadeOut() {
        var promises = [];
        if (this.$branch) promises.push(this.$branch.stop().fadeOut({ duration: 200 }).promise());
        this.parts.forEach(part => {
            if (part && part.$part) promises.push(part.$part.stop().fadeOut({ duration: 200 }).promise());
        });
        return Promise.all(promises);
    }

    public clone() {
        return new ComponentBranch({
            parts: this.parts.map(part => {
                return {
                    direction: part.direction,
                    x: part.x,
                    y: part.y
                };
            }),
            state: this.state
        });
    }
}
