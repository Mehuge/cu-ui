/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module BlockSelector {
    var $blocklist = $('#block-container');
    var $selectbutton = $('#select-block-tool');
    $selectbutton.click(() => {
        cu.SetBuildingMode(BuildUIMode.SelectingBlock);
    });

    function createBlockIcon(buildingID, icon) {
        var $listItem = $('<div/>').addClass('block-type');
        $listItem.css(
            {
                left: ((buildingID) % 2 * 75 + 15) + 'px',
                top: (Math.floor((buildingID) / 2) * 70) + 'px',
                background: "url('../images/blockselector/" + icon + "') no-repeat top left"
            });

        // Text stuff is just temporary until we get nice icons
        var text = icon.replace('btn.jpg', ' ');
        text = text.replace('-', ' ');
        text = text.replace('-', ' ');
        $listItem.text(text);


        $listItem.click(() => {
            cu.ChangeBlockType(buildingID);
        });
        $listItem.appendTo($blocklist);
    }

    cu.Listen('HandleReceiveBlocks', buildingDict => {
        for (var index in buildingDict) {
            var buildingID = Number(index);
            var icon = buildingDict[index];
            createBlockIcon(buildingID, icon);
        }
    });

    cuAPI.OnInitialized(() => {
        cu.RequestBlocks();
    });
}