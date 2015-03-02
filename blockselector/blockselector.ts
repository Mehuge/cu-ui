/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module BlockSelector {
    var currBuildingMode = BuildUIMode.PlacingPhantom;
    var $blocklist = $('#block-container');
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
        var $listItem = $('<div/>').addClass('block-type');
        $listItem.css(
            {
                left: ((index) % 2 * 75 + 15) + 'px',
                top: (Math.floor((index) / 2) * 70) + 'px',
                background: "url('../images/blockselector/" + icon + "') no-repeat top left"
            });
        $listItem.click(() => {
            cu.ChangeBlockType(buildingID);
        });
        $listItem.appendTo($blocklist);
    }

    cu.Listen('HandleReceiveBlocks', buildingDict => {
        var count = 1;
        for (var index in buildingDict) {
            var buildingID = Number(index);
            var icon = buildingDict[index];
            createBlockIcon(count, buildingID, icon);
            count++
        }
    });

    cuAPI.OnInitialized(() => {
        cu.RequestBlocks();
    });

    cu.Listen('HandleBuildingModeChanged', buildingMode => {
        currBuildingMode = buildingMode;
    });
}