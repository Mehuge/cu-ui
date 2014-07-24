/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/// <reference path="../vendor/jquery.d.ts" />

module Nameplate {
    var squareSize = 2048;
    var cellWidth = 256;
    var cellHeight = 64;
    var numCells = squareSize / cellWidth;
    var numRows = squareSize / cellHeight;

    //var divContent = "{NAME} &#8249;{GTAG}&#8250;<br />{TITLE}";
    var divContent = "{NAME} {GTAG}<br />{TITLE}";

    function UpdateNameplate(cell, colorMod, name, gtag, title) {
        // Position this cell
        var row = Math.floor(cell / numCells);
        var col = cell % numCells;

        // Compile the content into the base cell HTML string, we clean the different
        // inputs from the users to prevent injection
        var compiledStr = divContent.replace('{NAME}', $('<div/>').text(name).html());
        compiledStr = compiledStr.replace('{GTAG}', $('<div/>').text(gtag).html());
        compiledStr = compiledStr.replace('{TITLE}', $('<div/>').text(title).html());

        // Get our color based on the mod of the cell
        var color = '#FDFDFD';
        // Tuatha
        if (colorMod == 0) color = '#BBFFBB';
        // Viking
        if (colorMod == 1) color = '#BBBBFF';
        // Arthurian
        if (colorMod == 2) color = '#FFBBBB';
        // Other
        if (colorMod == 3) color = '#FFFF88';

        // Create the actual div
        var existingCell = $('#' + cell);
        if (existingCell.length > 0) {
            existingCell.css("color", color);
            existingCell.html(compiledStr);
        }
        else {
            $('<div/>', {
                id: cell,
                name: cell,
                style: 'color: ' + color + '; text-shadow: 2px 2px 4px #000000; position:absolute; TOP: ' + row * cellHeight + 'px; LEFT: ' + col * cellWidth + 'px; WIDTH: ' + cellWidth + 'px; HEIGHT: ' + cellHeight + 'px; overflow:hidden;'
            }).html(compiledStr).appendTo('body');
        }
    }

    // Register our callbacks with the CU API, these are functions
    // called by the underlying engine when certain events occur, 
    // such as needing to update a nameplate.
    cuAPI.OnUpdateNameplate(UpdateNameplate);
}