/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module BuildActions {
    var $rotateX = $('#btn-rotate-x');
    var $rotateY = $('#btn-rotate-y');
    var $rotateZ = $('#btn-rotate-z');
    var $flipX = $('#btn-flip-z');
    var $flipY = $('#btn-flip-y');
    var $flipZ = $('#btn-flip-z');

    $rotateX.click(() => {
        cu.RotateX();
    });

    $rotateY.click(() => {
        cu.RotateY();
    });

    $rotateZ.click(() => {
        cu.RotateZ();
    });

    $flipX.click(() => {
        cu.FlipX();
    });

    $flipY.click(() => {
        cu.FlipY();
    });

    $flipZ.click(() => {
        cu.FlipZ();
    });
}