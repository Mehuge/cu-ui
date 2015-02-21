/* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/// <reference path="../vendor/jquery.d.ts" />

module EquippedGear {
    var $items = $('#items');

    var $tooltip = $('#tooltip');

    var items = {};

    var addItems = {};

    var isHovered = false;

    var $body = $(document.body);

    var $gearSlots = {};

    // TODO: BD - get from client
    var gearSlotNames = {
        0: 'None',
        1: 'Chest',
        2: 'Left Hand',
        4: 'Right Hand',
        6: 'Two-Handed'
    };

    function createGearSlots() {
        $gearSlots = {};

        for (var gearSlot in gearSlotNames) {
            if (gearSlot == 0) continue;

            var $gearSlot = $('<li>').addClass('gearSlot').text(gearSlotNames[gearSlot]).appendTo($items);

            var $gearSlotList = $('<ul>').appendTo($gearSlot);

            $gearSlots[gearSlot] = $gearSlotList;
        }
    }

    function updateGearItemIDs(gearItemIDs) {
        $items.empty();

        createGearSlots();

        gearItemIDs.forEach(addItem);
    }

    function showTooltip(item) {
        isHovered = true;

        $tooltip.empty();

        for (var key in item) {
            if (!item.hasOwnProperty(key)) continue;

            var $row = $('<tr>');

            $('<td>').text(key + ':').appendTo($row);
            $('<td>').text(item[key]).appendTo($row);

            $row.appendTo($tooltip);
        }

        $tooltip.stop().fadeIn();
    }

    function hideTooltip() {
        isHovered = false;

        setTimeout(() => {
            if (!isHovered) $tooltip.stop().fadeOut(100);
        }, 10);
    }

    function moveTooltip(e) {
        var x = e.pageX + 12;
        var y = e.pageY + 10;

        var tooltipHeight = $tooltip.height();
        var maxWidth = $body.width() - $tooltip.width() - 30;
        var maxHeight = $body.height() - tooltipHeight - 30;

        if (y > maxHeight) {
            y = y - tooltipHeight - 40;
        }

        $tooltip.css({ top: (y > maxHeight) ? maxHeight : y, left: (x > maxWidth) ? maxWidth : x });
    }

    function updateItem(item: any) {
        items[item.itemID] = item;

        var hasAddItem = addItems.hasOwnProperty(item.itemID);

        if (hasAddItem) {
            delete addItems[item.itemID];

            addItem(item.itemID);
        }
    }

    function addItem(id: string) {
        if (!id || !id.length) return;

        var item = getItem(id);

        if (!item) {
            addItems[id] = true;

            cuAPI.GetItem(id);

            return;
        }

        if (hasItem(item.itemID)) return;

        var $item = $('<li></li>').attr('data-item-id', item.itemID).addClass('item');

        $item.mousedown(e => {
            switch (e.which) {
            case 1: // left mouse click
                break;
            case 2: // middle mouse click
                break;
            case 3: // right mouse click
                unequipItem(item);
                break;
            }
        }).dblclick(() => {
            unequipItem(item);
        });

        $item.hover(() => showTooltip(item), hideTooltip).mousemove(moveTooltip);

        $('<img />').addClass('icon').attr('src', '../images/items/icon.png').appendTo($item);

        $('<span />').addClass('name').text(item.name).appendTo($item);

        var $gearSlot = $gearSlots[item.gearSlot];

        $item.appendTo($gearSlot);

        $gearSlot.parent().show();

        sortItems($gearSlot);
    }

    function sortItems($gearSlot) {
        $($gearSlot.children().get().sort((a, b) => {
            return $(b).text() > $(a).text() ? -1 : 1;
        })).appendTo($gearSlot);
    }

    function removeItem(id: string) {
        if (!id || !id.length) return;

        var item = getItem(id);

        if (!item) return;

        var $item = findItem(item.itemID);

        if (!$item.length) return;

        if (!$item.siblings().length) {
            var $gearSlot = $gearSlots[item.gearSlot];

            $gearSlot.parent().hide();
        }

        $item.remove();
    }

    function getItem(id: string) {
        if (id && id.length && items.hasOwnProperty(id)) {
            return items[id];
        }
        return false;
    }

    function findItem(id: string) {
        return $items.find('[data-item-id="' + id + '"]');
    }

    function hasItem(id: string) {
        return findItem(id).length > 0;
    }

    function unequipItem(item: any) {
        hideTooltip();

        cuAPI.UnequipItem(item.itemID);
    }

    createGearSlots();

    if (cu.HasAPI()) {
        cu.OnInitialized(() => {
            // start hidden
            cuAPI.HideUI('equippedgear');

            cuAPI.OnItemEquipped(addItem);

            cuAPI.OnItemUnequipped(removeItem);

            cuAPI.OnGetItem(updateItem);

            cuAPI.OnEquippedGearItemIDsChanged(updateGearItemIDs);
        });
    }
}
