/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/// <reference path="../vendor/jquery.d.ts" />

module Inventory {
    var $items = $('#items');

    var $tooltip = $('#tooltip');

    var items = {};

    var addItems = {};

    var isHovered = false;

    var $body = $(document.body);

    function updateInventoryItemIDs(inventoryItemIDs) {
        $items.empty();

        for (var key in items) {
            items[key].isVisible = false;
        }

        inventoryItemIDs.forEach(addItem);
    }

    function showTooltip(item) {
        isHovered = true;

        $tooltip.empty();

        for (var key in item) {
            if (key == 'itemIDs' || key == 'isVisible' || !item.hasOwnProperty(key)) continue;

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
        item.itemIDs = [item.itemID];

        items[item.itemID] = item;

        if (addItems.hasOwnProperty(item.itemID)) {
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

        var stackable = getStackable(item);

        if (stackable) {
            if (stackable.itemIDs.indexOf(item.itemID) === -1) {
                stackable.itemIDs.push(item.itemID);
            }

            updateItemQuantity(stackable);

            return;
        }

        if (item.itemIDs.indexOf(id) === -1) {
            item.itemIDs.push(id);
        }

        if (hasItem(item.itemID)) {
            updateItemQuantity(item);

            return;
        }

        var $item = $('<li></li>').attr({
            'data-item-id': item.itemID,
            'data-item-type': item.type
        }).addClass('item');

        $item.mousedown(e => {
            switch (e.which) {
            case 1: // left mouse click
                break;
            case 2: // middle mouse click
                break;
            case 3: // right mouse click
                equipItem(item);
                break;
            }
        }).dblclick(() => {
            equipItem(item);
        });

        $item.hover(() => showTooltip(item), hideTooltip).mousemove(moveTooltip);

        $('<img />').addClass('icon').attr('src', '../images/items/icon.png').appendTo($item);

        $('<span />').addClass('name').text(item.name).appendTo($item);

        $('<span />').addClass('quantity').text(item.itemIDs.length).appendTo($item);

        item.isVisible = true;

        $item.appendTo($items);

        sortItems();
    }

    function sortItems() {
        $($items.children().get().sort((a, b) => {
            var $a = $(a);
            var $b = $(b);
            var aType = parseInt($a.attr('data-item-type'));
            var bType = parseInt($b.attr('data-item-type'));
            var aText = $a.text();
            var bText = $b.text();
            return bType > aType ? -1 : bType < aType ? 1 : bText > aText ? -1 : bText < aText ? 1 : 0;
        })).appendTo($items);
    }

    function removeItem(id: string) {
        if (!id || !id.length) return;

        var item = getVisibleItem(id);

        if (!item) return;

        item.itemIDs.splice(item.itemIDs.indexOf(id), 1);

        if (item.itemIDs.length) {
            updateItemQuantity(item);
        } else {
            item.isVisible = false;

            findItem(item.itemID).remove();
        }
    }

    function getItem(id: string) {
        if (id && id.length && items.hasOwnProperty(id)) {
            return items[id];
        }
        return false;
    }

    function getVisibleItem(id: string) {
        if (!id || !id.length) return false;
        var item;
        for (var key in items) {
            item = items[key];
            if (item.isVisible && item.itemIDs.indexOf(id) !== -1) return item;
        }
        return false;
    }

    function findItem(id: string) {
        return $items.find('[data-item-id="' + id + '"]');
    }

    function hasItem(id: string) {
        return findItem(id).length > 0;
    }

    function getStackable(item: any) {
        for (var key in items) {
            var other = items[key];
            if (other.isVisible &&
                item.itemID !== other.itemID &&
                item.type == other.type &&
                item.name == other.name &&
                item.description == other.description &&
                item.carryingRequirement == other.carryingRequirement &&
                item.resourceID == other.resourceID) {
                return other;
            }
        }
        return false;
    }

    function updateItemQuantity(item: any) {
        findItem(item.itemID).find('.quantity').text(item.itemIDs.length);
    }

    function equipItem(item: any) {
        var id = item.itemIDs[item.itemIDs.length - 1];

        hideTooltip();

        cuAPI.EquipItem(id);
    }

    if (cu.HasAPI()) {
        cu.OnInitialized(() => {
            cuAPI.OnItemEquipped(removeItem);

            cuAPI.OnItemUnequipped(addItem);

            cuAPI.OnGetItem(updateItem);

            cuAPI.OnInventoryItemIDsChanged(updateInventoryItemIDs);
        });
    }
}
