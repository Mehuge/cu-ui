/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module BuildActions {

    class BuildActionButton {
        constructor(public id: string, public keyBindName: string, private cu: CU) {
            this.rootElement = $(id);
            var $key = $('<span>').addClass('key').appendTo(this.rootElement);

            cu.GetConfigVar(keyBindName);

            cu.Listen('HandleReceiveConfigVar', (configVar) => {
                if (configVar && configVar.hasOwnProperty(keyBindName)) {
                    var key = KeyCode.dxKeyCodeMap[configVar[keyBindName]];
                    if (key) {
                        $key.text(key);
                    }
                }
            });

            cu.Listen('HandleSavedConfigChanges', () => {
                cu.GetConfigVar(keyBindName);
            });
        }
        rootElement: JQuery;
    }
    var commit;
    var cancel;
    var rotateX;
    var rotateY;
    var rotateZ;
    var flipX;
    var flipY;
    var flipZ;
    cuAPI.OnInitialized(() => {
        commit = new BuildActionButton('#btn-commit', 'Commit Block', cu);
        commit.rootElement.addClass('add-btn');
        var commitTooltip = new Tooltip(commit.rootElement, {
            title: () => "Commit Block",
            content: () => "Commits a placed to the world, or deletes a selected block."
        });
        cancel = new BuildActionButton('#btn-cancel', 'Undo Block Position', cu);
        var cancelTooltip = new Tooltip(cancel.rootElement, {
            title: () => "Return Block To Cursor",
            content: () => "Returns a placed but not yet committed block or selection to your cursor."
        });
        rotateX = new BuildActionButton('#btn-rotate-x', 'Rotate Block X', cu);
        var rotateXTooltip = new Tooltip(rotateX.rootElement, {
            title: () => "Rotate Block X",
            content: () => "Rotates the block you wish to place by 90 degrees on its X axis."
        });
        rotateY = new BuildActionButton('#btn-rotate-y', 'Rotate Block Y', cu);
        var rotateYTooltip = new Tooltip(rotateY.rootElement, {
            title: () => "Rotate Block Y",
            content: () => "Rotates the block you wish to place by 90 degrees on its Y axis."
        });
        rotateZ = new BuildActionButton('#btn-rotate-z', 'Rotate Block Z', cu);
        var rotateZTooltip = new Tooltip(rotateZ.rootElement, {
            title: () => "Rotate Block Z",
            content: () => "Rotates the block you wish to place by 90 degrees on its Z axis."
        });
        flipX = new BuildActionButton('#btn-flip-x', 'Flip Block X', cu);
        var flipXTooltip = new Tooltip(flipX.rootElement, {
            title: () => "Flip Block X",
            content: () => "Inverts the block you wish to place, swapping its positive and negative X faces."
        });
        flipY = new BuildActionButton('#btn-flip-y', 'Flip Block Y', cu);
        var flipYTooltip = new Tooltip(flipY.rootElement, {
            title: () => "Flip Block Y",
            content: () => "Inverts the block you wish to place, swapping its positive and negative Y faces."
        });
        flipZ = new BuildActionButton('#btn-flip-z', 'Flip Block Z', cu);
        var flipZTooltip = new Tooltip(flipZ.rootElement, {
            title: () => "Flip Block Z",
            content: () => "Inverts the block you wish to place, swapping its positive and negative Z faces."
        });

        commit.rootElement.click(() => {
            cu.CommitBlock();
            if (!commit.rootElement.find('.button-active').length) {
                commit.rootElement.append($('<img/>').addClass('button-active').attr('src', '../images/skillbar/active-frame.gif'));
                setTimeout(() => {
                    commit.rootElement.find('.button-active').remove();
                }, 1000);
            }
        });

        cancel.rootElement.click(() => {
            cu.CancelBlockPlacement();
            if (!cancel.rootElement.find('.button-active').length) {
                cancel.rootElement.append($('<img/>').addClass('button-active').attr('src', '../images/skillbar/active-frame.gif'));
                setTimeout(() => {
                    cancel.rootElement.find('.button-active').remove();
                }, 1000);
            }
        });

        rotateX.rootElement.click(() => {
            cu.BlockRotateX();
            if (!rotateX.rootElement.find('.button-active').length) {
                rotateX.rootElement.append($('<img/>').addClass('button-active').attr('src', '../images/skillbar/active-frame.gif'));
                setTimeout(() => {
                    rotateX.rootElement.find('.button-active').remove();
                }, 1000);
            }
        });

        rotateY.rootElement.click(() => {
            cu.BlockRotateY();
            if (!rotateY.rootElement.find('.button-active').length) {
                rotateY.rootElement.append($('<img/>').addClass('button-active').attr('src', '../images/skillbar/active-frame.gif'));
                setTimeout(() => {
                    rotateY.rootElement.find('.button-active').remove();
                }, 1000);
            }
        });

        rotateZ.rootElement.click(() => {
            cu.BlockRotateZ();
            if (!rotateZ.rootElement.find('.button-active').length) {
                rotateZ.rootElement.append($('<img/>').addClass('button-active').attr('src', '../images/skillbar/active-frame.gif'));
                setTimeout(() => {
                    rotateZ.rootElement.find('.button-active').remove();
                }, 1000);
            }
        });

        flipX.rootElement.click(() => {
            cu.BlockFlipX();
            if (!flipX.rootElement.find('.button-active').length) {
                flipX.rootElement.append($('<img/>').addClass('button-active').attr('src', '../images/skillbar/active-frame.gif'));
                setTimeout(() => {
                    flipX.rootElement.find('.button-active').remove();
                }, 1000);
            }
        });

        flipY.rootElement.click(() => {
            cu.BlockFlipY();
            if (!flipY.rootElement.find('.button-active').length) {
                flipY.rootElement.append($('<img/>').addClass('button-active').attr('src', '../images/skillbar/active-frame.gif'));
                setTimeout(() => {
                    flipY.rootElement.find('.button-active').remove();
                }, 1000);
            }
        });

        flipZ.rootElement.click(() => {
            cu.BlockFlipZ();
            if (!flipZ.rootElement.find('.button-active').length) {
                flipZ.rootElement.append($('<img/>').addClass('button-active').attr('src', '../images/skillbar/active-frame.gif'));
                setTimeout(() => {
                    flipZ.rootElement.find('.button-active').remove();
                }, 1000);
            }
        });
    });

    cu.Listen('HandleBuildingModeChanged', buildingMode => {
        if (buildingMode == BuildUIMode.SelectingBlock) {
            commit.rootElement.removeClass('add-btn');
            if (!commit.rootElement.hasClass('remove-btn')) {
                commit.rootElement.addClass('remove-btn');
            }
        } else if (buildingMode == BuildUIMode.PlacingPhantom) {
            commit.rootElement.removeClass('remove-btn');
            if (!commit.rootElement.hasClass('add-btn')) {
                commit.rootElement.addClass('add-btn');
            }
        }
    });
}