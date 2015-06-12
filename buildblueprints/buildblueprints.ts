/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
module BuildBlueprints {
    var $btnClose = $('.window-close');

    var $cpyBtn = $('#btn-copy');
    var $pasteBtn = $('#btn-paste');
    var $saveBtn = $('#btn-save');
    var $reloadBtn = $('#btn-reload');
    var $afterSave = $('#after-save');
    $afterSave.hide();
    var $cancelBtn = $('#btn-cancel');
    var $okBtn = $('#btn-ok');

    var $filename = $('#filename');

    $filename.on("keydown", function (event) {
        // Allow controls such as backspace
        var arr = [8, 16, 17, 20, 35, 36, 37, 38, 39, 40, 45, 46];

        // Allow letters
        for (var i = 65; i <= 90; i++) {
            arr.push(i);
        }

        // Prevent default if not in array
        if (jQuery.inArray(event.which, arr) === -1) {
            event.preventDefault();
        }
    });

    $filename.attr('maxlength', '10');

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

    function reloadBlueprints() {
        $("#blueprint-container").empty();
        cu.RequestBlueprints();
    }

    $reloadBtn.click(reloadBlueprints);

    cu.OnInitialized(() => {
        reloadBlueprints();
    });

    $saveBtn.click(() => {
        ToggleSaveMode(true);
    });

    function ToggleSaveMode(enterSaveMode : boolean) {
        if (enterSaveMode) {
            $afterSave.show();
            $saveBtn.hide();
            $reloadBtn.hide();
            $filename.show();
            $filename.val('');
        } else {
            $afterSave.hide();
            $filename.hide();
            $saveBtn.show();
            $reloadBtn.show();
            $filename.val('');
        }
    }

    $cancelBtn.click(() => {
        ToggleSaveMode(false);
    });


    $okBtn.click(() => {
        SaveBlueprint($filename.val());
        ToggleSaveMode(false);
    });

    function SaveBlueprint(name) {
        cu.SaveBlueprint(name);
    }

    cu.Listen('HandleBuildingModeChanged', buildingMode => {
        if (buildingMode == BuildUIMode.BlockSelected || buildingMode == BuildUIMode.SelectingBlock) {
            $cpyBtn.prop('disabled', false);
        } else if (buildingMode == BuildUIMode.PlacingPhantom || buildingMode == BuildUIMode.PhantomPlaced) {
            $cpyBtn.prop('disabled', true);
        }
    });

    cu.Listen('HandleNewBlueprint', (index, name) => {
        var $newBlueprint = $("<div class='blueprint'>");
        $newBlueprint.text(name);
        $newBlueprint.click(() => {
            cu.SelectBlueprint(index);
        });
        $("#blueprint-container").prepend($newBlueprint);
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
    $filename.focus(handleInputOwnership);
    $saveBtn.focus(handleInputOwnership);
    $reloadBtn.focus(handleInputOwnership);
    $okBtn.focus(handleInputOwnership);
    $cancelBtn.focus(handleInputOwnership);
    $cpyBtn.blur(handleInputOwnership);
    $pasteBtn.blur(handleInputOwnership);
    $btnClose.blur(handleInputOwnership);
    $filename.blur(handleInputOwnership);
    $saveBtn.blur(handleInputOwnership);
    $reloadBtn.blur(handleInputOwnership);
    $okBtn.blur(handleInputOwnership);
    $cancelBtn.blur(handleInputOwnership);
}