/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
module BuildBlueprints {
    var $btnClose = $('.window-close');

    var $cpyBtn = $('#btn-copy');
    var $pasteBtn = $('#btn-paste');

    export var $blueprintWindow = $('#blueprint-window');

    function hideBuildBlueprints(e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        $blueprintWindow.fadeOut(() => {
            if (typeof cuAPI === 'object') {
                cuAPI.HideUI('buildblueprints');
                setTimeout(() => {
                    $blueprintWindow.css({ display: 'block' });
                }, 100);
            }
        });

        return false;
    }

    $btnClose.click(hideBuildBlueprints);

    $pasteBtn.prop('disabled', true);
    $cpyBtn.prop('disabled', true);
    $cpyBtn.click(() => {
        cu.CopyBlueprint();
    });
    $pasteBtn.click(() => {
        cu.PasteBlueprint();
    });

    cu.Listen('HandleBuildingModeChanged', buildingMode => {
        if (buildingMode == BuildUIMode.BlockSelected || buildingMode == BuildUIMode.SelectingBlock) {
            $cpyBtn.prop('disabled', false);
        } else if (buildingMode == BuildUIMode.PlacingPhantom || buildingMode == BuildUIMode.PhantomPlaced) {
            $cpyBtn.prop('disabled', true);
        }
    });

    cu.Listen('HandleCopyBlueprint', () => {
        $pasteBtn.prop('disabled', false);
    });

    var inputOwnershipTimer: number;
    function handleInputOwnership(e: any) {
        if (e.type === "focus") {
            if (inputOwnershipTimer) {
                clearTimeout(inputOwnershipTimer);
                inputOwnershipTimer = null;
            } else {
                cuAPI.RequestInputOwnership();
            }
        } else {
            inputOwnershipTimer = setTimeout(() => {
                inputOwnershipTimer = null;
                cuAPI.ReleaseInputOwnership();
            }, 10);
        }
    }

    $cpyBtn.focus(handleInputOwnership);
    $pasteBtn.focus(handleInputOwnership);
    $btnClose.focus(handleInputOwnership);
    $cpyBtn.blur(handleInputOwnership);
    $pasteBtn.blur(handleInputOwnership);
    $btnClose.blur(handleInputOwnership);
}