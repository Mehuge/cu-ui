/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module BlockSelector {
    class BlockIcon {
        constructor(public icon: string, public buildingID: number, private cu: CU) {
            this.rootElement = $('<div/>').addClass('block-type');
            this.rootElement.css(
                {
                    background: "url('../images/blockselector/" + icon + "') no-repeat top left"
                });
            this.rootElement.click(() => {
                cu.ChangeBlockType(buildingID);
            });
            this.rootElement.appendTo($blockContainer);

            this.shapeTags = [""];
            this.typeTags = [""];
            cu.RequestBlockTags(buildingID);

            cu.Listen('HandleReceiveBlockTags', (blockID, tagDict) => {
                if (blockID === buildingID) {
                    this.shapeTags = tagDict["Shapes"];
                    this.typeTags = tagDict["Types"];
                    var text = "Shapes: ";
                    for (var tagIndex in this.shapeTags) {
                        text += this.shapeTags[tagIndex];
                        text += ", ";
                    }
                    text = text.substring(0, text.length - 2);
                    text += "\nTypes: ";
                    for (var tagIndex in this.typeTags) {
                        text += this.typeTags[tagIndex];
                        text += ", ";
                    }
                    text = text.substring(0, text.length - 2);

                    this.tooltip = new Tooltip(this.rootElement, {
                        title: "Tags",
                        content: text
                    });
                }
            });
        }

        public SetVisibility(isVisible): void {
            if (isVisible) {
                this.rootElement.css(
                    {
                        display: 'inline-block'
                    });
            }
            else {
                this.rootElement.css(
                    {
                        display: 'none'
                    });
            }
        }
        rootElement: JQuery;
        tooltip: Tooltip;
        shapeTags: string[];
        typeTags: string[];
    }

    var $shapeFilter = $('#shape-filter');
    var $typeFilter = $('#type-filter');
    var currBuildingMode = BuildUIMode.PlacingPhantom;
    var $blockContainer = $('#block-container');
    var blockList = [];
    var $selectbutton = $('#select-block-tool');
    $selectbutton.click(() => {
        if (currBuildingMode === BuildUIMode.PlacingPhantom || currBuildingMode === BuildUIMode.PhantomPlaced) {
            cu.SetBuildingMode(BuildUIMode.SelectingBlock);
        }
        else if (currBuildingMode === BuildUIMode.SelectingBlock || currBuildingMode === BuildUIMode.BlockSelected) {
            cu.SetBuildingMode(BuildUIMode.PlacingPhantom);
        }
    });

    function createBlockIcon(index, buildingID, icon) {
        blockList[index] = new BlockIcon(icon, buildingID, cu);
    }

    function FilterBlocks() {
        var shapeText = $shapeFilter.val().toLowerCase();
        var typeText = $typeFilter.val().toLowerCase();
        for (var blockIndex in blockList) {
            var block = blockList[blockIndex];
            var tagsFound = 0;
            for (var tagIndex in block.shapeTags) {
                var tag = block.shapeTags[tagIndex].toLowerCase();
                if (tag.indexOf(shapeText) != -1) {
                    tagsFound += 1;
                    break;
                }
            }
            for (var tagIndex in block.typeTags) {
                var tag = block.typeTags[tagIndex].toLowerCase();
                if (tag.indexOf(typeText) != -1) {
                    tagsFound += 1;
                    break;
                }
            }
            block.SetVisibility(tagsFound === 2);
        }
    }

    cu.Listen('HandleReceiveBlocks', buildingDict => {
        var count = 1;
        for (var index in buildingDict) {
            var buildingID = Number(index);
            var icon = buildingDict[index];
            createBlockIcon(count, buildingID, icon);
            count++
        }

        $shapeFilter.change(function () {
            FilterBlocks();
        });

        $shapeFilter.focus(function () {
            cuAPI.RequestInputOwnership();
        }).blur(function () {
            cuAPI.ReleaseInputOwnership();
        });

        $typeFilter.change(function () {
            FilterBlocks();
        });

        $typeFilter.focus(function () {
            cuAPI.RequestInputOwnership();
        }).blur(function () {
            cuAPI.ReleaseInputOwnership();
        });
    });

    cuAPI.OnInitialized(() => {
        cu.RequestBlocks();
    });

    cu.Listen('HandleBuildingModeChanged', buildingMode => {
        currBuildingMode = buildingMode;
    });
}