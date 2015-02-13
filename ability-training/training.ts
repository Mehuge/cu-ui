/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module AbilityTraining {
    /* jQuery Elements */
    var $document = $(document);
    var $btnPath = $('#btn-path');
    var $componentPath = $('#component-path');
    var $componentType = $('#component-type');
    var $components = $('#components');
    var $train = $('#train');
    var $untrain = $('#untrain');
    var $halt = $('#halt');
    var $resume = $('#resume');
    var $pathRankModal = $('#path-rank-modal');

    /* Variables */

    var previousComponentPath;
    var currentComponentPath;
    var previousComponentType;
    var currentComponentType;
    var selectedSlot;
    var selectedComponent;

    var componentNetworks = [network1, network2];

    /* Functions */

    function ignoreEvent(e) {
        e.preventDefault();
        e.stopPropagation();
        return false;
    }

    function updateComponentNetworkVisiblity() {
        componentNetworks.forEach(componentNetwork => {
            var hasComponentPath = _.isUndefined(currentComponentPath);
            var hasComponentType = _.isUndefined(currentComponentType);

            componentNetwork.slots.forEach(slot => {
                if (!slot || !slot.component) return;

                if (slot.component.path === currentComponentPath) {
                    hasComponentPath = true;

                    slot.$slot.addClass('current-path ' + getPathCssClassName(slot.component.path));
                } else {
                    slot.$slot.removeClass('current-path ' + getPathCssClassName(slot.component.path));
                }

                if (slot.component.type === currentComponentType) {
                    hasComponentType = true;
                }
            });

            componentNetwork.$network.css('display', hasComponentPath && hasComponentType ? 'block' : 'none');
        });

        if (selectedSlot && !selectedSlot.$slot.is(':visible')) {
            deselectComponentSlot();
        }
    }

    function getPathCssClassName(path) {
        var pathName = ComponentPath[path];
        if (!pathName) return '';
        return pathName.toLowerCase().replace(' ', '-');
    }

    function isValidComponentPathForArchetype(path, value) {
        // TODO: filter by archetype
        return isNaN(parseInt(path));
    }

    function isValidComponentSubTypeForArchetype(subType, value) {
        // TODO: filter by archetype
        return isNaN(parseInt(subType)) && value > ComponentSubType.None;
    }

    function updateComponentPath(e) {
        previousComponentPath = currentComponentPath;

        currentComponentPath = parseInt($(this).val(), 10);

        if (isNaN(currentComponentPath)) currentComponentPath = undefined;

        updateComponentNetworkVisiblity();

        var hasPath = !_.isUndefined(currentComponentPath);

        $btnPath.prop('disabled', !hasPath);

        if (previousComponentPath !== currentComponentPath) {
            updatePathRankModal();
        }

        hasPath ? showPathRankModal(e) : hidePathRankModal(e);
    }

    function updateComponentType() {
        previousComponentType = currentComponentType;

        currentComponentType = parseInt($(this).val(), 10);

        if (isNaN(currentComponentType)) currentComponentType = undefined;

        updateComponentNetworkVisiblity();

        if (previousComponentType !== currentComponentType) {
            updatePathRankModal();
        }
    }

    function updatePathRankModal() {
        $pathRankModal.removeClass(getPathCssClassName(previousComponentPath));
        $pathRankModal.addClass(getPathCssClassName(currentComponentPath));
        $pathRankModal.empty();

        var hasComponentPath = !_.isUndefined(currentComponentPath);

        if (hasComponentPath) {
            var slots = getComponentSlotsForPathRankModal();

            var ranks = [];

            var maxX = 36;

            slots.forEach(slot => {
                var componentRank = slot.component.rank;

                var rank = ranks.filter(r => r.rank === componentRank)[0];

                if (!rank) {
                    var $rank = createPathRankElement(componentRank);
                    var $ranks = createPathRankContainer().appendTo($rank);
                    rank = { rank: componentRank, $rank: $rank, $ranks: $ranks, x: 0, y: 0 };
                    ranks.push(rank);
                }

                var clonedSlot = slot.clone();
                var clonedComponent = slot.component.clone();

                clonedSlot.setComponent(clonedComponent);
                clonedComponent.setSlot(clonedSlot);

                clonedSlot.x = rank.x;
                clonedSlot.y = rank.y;

                clonedSlot.createElement().on('click', e => {
                    e.preventDefault();
                    e.stopPropagation();

                    selectComponentSlot(slot);

                    return false;
                }).appendTo(rank.$ranks);

                clonedComponent.createElement().appendTo(rank.$ranks);

                slot.pathRankSlot = clonedSlot;

                rank.x += 6;

                if (rank.x >= maxX) {
                    rank.x = 0;
                    rank.y += 6;
                }
            });

            ranks.sort((a, b) => a.rank - b.rank);

            ranks.forEach(rank => {
                rank.$ranks.css('height', (rank.y + 4) * GRID_CELL_HEIGHT);

                rank.$rank.appendTo($pathRankModal);
            });
        }
    }

    function showPathRankModal(e) {
        e.preventDefault();
        e.stopPropagation();

        if (_.isUndefined(currentComponentPath)) return false;

        $btnPath.addClass('flip');

        $pathRankModal.stop().fadeIn({ duration: 200 }).scrollTop(0);

        return false;
    }

    function hidePathRankModal(e) {
        e.preventDefault();
        e.stopPropagation();

        $btnPath.removeClass('flip');

        $pathRankModal.stop().fadeOut({ duration: 150 });

        return false;
    }

    function togglePathRankModal(e) {
        $pathRankModal.is(':visible') ? hidePathRankModal(e) : showPathRankModal(e);
    }

    function createPathRankElement(rank) {
        var $rank = $('<div>').addClass('path-rank');

        $('<h4>').addClass('path-rank-title').text('Rank ' + rank).appendTo($rank);

        return $rank;
    }

    function createPathRankContainer() {
        var $ranks = $('<div>').addClass('path-ranks fifty-percent-zoom');

        return $ranks;
    }

    function getComponentSlotsForPathRankModal() {
        var slots = [];

        var hasComponentType = !_.isUndefined(currentComponentType);

        componentNetworks.forEach(componentNetwork => {
            componentNetwork.slots.forEach(slot => {
                if (!slot || !slot.component || _.isUndefined(slot.component.rank)) return;

                if (slot.component.path === currentComponentPath && (!hasComponentType || slot.component.type === currentComponentType)) {
                    slots.push(slot);
                }
            });
        });

        return slots;
    }

    function trainComponent(e) {
        e.preventDefault();
        e.stopPropagation();

        if (!selectedSlot || !selectedComponent) return false;

        $train.prop('disabled', true);

        selectedComponent.train().then(() => {
            console.log('trained ' + selectedComponent.name + '!');

            selectedSlot.updateElement();

            selectedComponent.updateElement();

            selectedSlot.children.forEach(slot => {
                slot.isDisabled = (!slot.component || !slot.component.isTrained) && !hasTrainedParents(slot);

                slot.updateElement();

                updatePathRankSlot(slot);
            });

            updatePathRankSlot(selectedSlot);

            updateButtonStates();
        }, () => {
            console.log('training ' + selectedComponent.name + ' failed.');

            $train.prop('disabled', false);
        });

        return false;
    }

    function untrainComponent(e) {
        e.preventDefault();
        e.stopPropagation();

        if (!selectedSlot || !selectedComponent) return false;

        $untrain.prop('disabled', true);

        selectedComponent.untrain().then(() => {
            console.log('untrained ' + selectedComponent.name + '.');

            selectedSlot.updateElement();

            selectedComponent.updateElement();

            selectedSlot.children.forEach(slot => {
                slot.isDisabled = (!slot.component || !slot.component.isTrained) && !hasTrainedParents(slot);

                slot.updateElement();
            });

            if (selectedSlot.pathRankSlot && selectedSlot.pathRankSlot.component) {
                selectedSlot.pathRankSlot.component.isTrained = false;

                selectedSlot.pathRankSlot.component.updateElement();
            }

            updateButtonStates();
        }, () => {
            console.log('untraining ' + selectedComponent.name + ' failed.');

            $untrain.prop('disabled', false);
        });

        return false;
    }

    function haltComponent(e) {
        e.preventDefault();
        e.stopPropagation();

        if (!selectedSlot || !selectedComponent) return false;

        $halt.prop('disabled', true);

        selectedComponent.halt().then(() => {
            console.log('halted ' + selectedComponent.name + '.');

            updateButtonStates();
        }, () => {
            console.log('halting ' + selectedComponent.name + ' failed.');

            $halt.prop('disabled', false);
        });

        return false;
    }

    function resumeComponent(e) {
        e.preventDefault();
        e.stopPropagation();

        if (!selectedSlot || !selectedComponent) return false;

        $resume.prop('disabled', true);

        selectedComponent.resume().then(() => {
            console.log('resumed ' + selectedComponent.name + '.');

            updateButtonStates();
        }, () => {
            console.log('resuming ' + selectedComponent.name + ' failed.');

            $resume.prop('disabled', false);
        });

        return false;
    }

    function updatePathRankSlot(slot) {
        if (slot && slot.pathRankSlot && slot.pathRankSlot.component) {
            slot.pathRankSlot.isDisabled = slot.isDisabled;

            slot.pathRankSlot.updateElement();

            slot.pathRankSlot.component.isTrained = slot.component.isTrained;

            slot.pathRankSlot.component.updateElement();
        }
    }

    function hasTrainedParents(slot) {
        if (slot.parents.length === 0) return true;

        var parent;
        for (var i = 0, length = slot.parents.length; i < length; i++) {
            parent = slot.parents[i];

            if (!parent.component || !parent.component.isTrained) {
                return false;
            }
        }

        return true;
    }

    function hasTrainedChildren(slot) {
        if (slot.children.length === 0) return false;

        var child;
        for (var i = 0, length = slot.children.length; i < length; i++) {
            child = slot.children[i];

            if (child.component && child.component.isTrained) {
                return true;
            }
        }

        return false;
    }

    function selectComponentSlot(slot) {
        if (slot.isDisabled) return;

        if (selectedSlot) {
            selectedSlot.$slot.removeClass('selected');

            if (selectedSlot.pathRankSlot) {
                selectedSlot.pathRankSlot.$slot.removeClass('selected');
            }
        }

        selectedSlot = selectedSlot !== slot ? slot : undefined;
        selectedComponent = selectedComponent !== slot.component ? slot.component : undefined;

        if (selectedSlot) {
            selectedSlot.$slot.addClass('selected');

            if (selectedSlot.pathRankSlot) {
                selectedSlot.pathRankSlot.$slot.addClass('selected');
            }
        }

        updateButtonStates();
    }

    function deselectComponentSlot() {
        if (selectedSlot) {
            selectedSlot.$slot.removeClass('selected');

            if (selectedSlot.pathRankSlot) {
                selectedSlot.pathRankSlot.$slot.removeClass('selected');
            }
        }

        selectedSlot = undefined;
        selectedComponent = undefined;

        updateButtonStates();
    }

    function updateButtonStates() {
        var hasSelectedSlot = !_.isUndefined(selectedSlot);
        var hasSelectedComponent = !_.isUndefined(selectedComponent);

        var isUnselected = !hasSelectedSlot || !hasSelectedComponent;

        $train.prop('disabled', isUnselected || selectedComponent.isTrained);
        $untrain.prop('disabled', isUnselected || !selectedComponent.isTrained || hasTrainedChildren(selectedSlot));
        $halt.prop('disabled', isUnselected || !selectedComponent.isTrained || selectedComponent.isHalted);
        $resume.prop('disabled', isUnselected || !selectedComponent.isTrained || !selectedComponent.isHalted);

        if (hasSelectedComponent && selectedComponent.isHalted) {
            $halt.hide();
            $resume.show();
        } else {
            $halt.show();
            $resume.hide();
        }
    }

    function initializeComponentSlot(slot) {
        if (!slot || !slot.component) return;

        slot.isDisabled = !slot.component.isTrained && !hasTrainedParents(slot);

        slot.updateElement();

        slot.component.createElement().appendTo(slot.parent());

        slot.on('mousedown', e => {
            e.preventDefault();
            e.stopPropagation();

            selectComponentSlot(slot);

            return false;
        }).on('click', ignoreEvent);
    }

    function initializeComponentNetwork(componentNetwork) {
        componentNetwork.createElement().appendTo($components);

        componentNetwork.slots.forEach(initializeComponentSlot);
    }

    function initialize() {
        $document.click(deselectComponentSlot).on('contextmenu', ignoreEvent);

        $btnPath.click(togglePathRankModal);

        $componentPath.change(updateComponentPath).click(ignoreEvent);

        $componentType.change(updateComponentType).click(ignoreEvent);

        $train.click(trainComponent);

        $untrain.click(untrainComponent);

        $halt.click(haltComponent);

        $resume.click(resumeComponent);

        $pathRankModal.click(e => {
            e.preventDefault();
            e.stopPropagation();

            deselectComponentSlot();

            return false;
        });

        componentNetworks.forEach(initializeComponentNetwork);

        for (var path in ComponentPath) {
            var pathValue = ComponentPath[path];
            if (isValidComponentPathForArchetype(path, pathValue)) {
                $('<option>').text(path).val(pathValue).appendTo('#component-path');
            }
        }

        for (var subType in ComponentSubType) {
            var subTypeValue = ComponentSubType[subType];
            if (isValidComponentSubTypeForArchetype(subType, subTypeValue)) {
                $('<option>').text(subType).val(subTypeValue).appendTo('#component-type');
            }
        }
    }

    initialize();
}