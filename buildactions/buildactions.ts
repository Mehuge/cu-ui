/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module BuildActions {
    var $commit = $('#btn-commit');
    var $cancel = $('#btn-cancel');
    var $rotateX = $('#btn-rotate-x');
    var $rotateY = $('#btn-rotate-y');
    var $rotateZ = $('#btn-rotate-z');
    var $flipX = $('#btn-flip-z');
    var $flipY = $('#btn-flip-y');
    var $flipZ = $('#btn-flip-z');

    $commit.click(() => {
        cu.CommitBlock();
    });

    $cancel.click(() => {
        cu.CancelBlockPlacement();
    });

    $rotateX.click(() => {
        cu.BlockRotateX();
    });

    $rotateY.click(() => {
        cu.BlockRotateY();
    });

    $rotateZ.click(() => {
        cu.BlockRotateZ();
    });

    $flipX.click(() => {
        cu.BlockFlipX();
    });

    $flipY.click(() => {
        cu.BlockFlipY();
    });

    $flipZ.click(() => {
        cu.BlockFlipZ();
    });
}