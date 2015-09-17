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

    var serverAddress = "";
    var charID = "";
    var token = "";

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

    $filename.on('input propertychange paste', function () {
        $okBtn.prop("disabled", false);

        if ($filename.val() === '') {
            $okBtn.prop("disabled", true);
            return;
        }
        $("#blueprint-container").children().each(function (index) {
            var text = $(this).text();
            if ($filename.val() == text) {
                $okBtn.prop("disabled", true);
            }
        });
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
        cu.DownloadBlueprints();
    }

    $reloadBtn.click(reloadBlueprints);

    cu.OnInitialized(() => {
        $.support.cors = true;
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
            $okBtn.prop("disabled", true);
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
        $("#blueprint-container").children().each(function (i) {
            var text = $(this).text();
            if (name == text) {
                $(this).remove();
            }
        });
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

    cu.Listen('HandleDownloadBlueprints',(charid) => {
        serverAddress = cu.SecureApiUrl('api/blueprint');
        charID = charid;
        token = cuAPI.loginToken;
        $.ajax({
            type: 'GET',
            url: serverAddress,
            data: {
                characterID: charID,
                loginToken: token
            },
            contentType : 'application/json; charset=utf-8',
            timeout: 10000
        }).done((data) => {
            for (var i = 0; i < data.blueprints.length; ++i) {
                cu.ReceiveBlueprintFromServer(data.blueprints[i].name, data.blueprints[i].cellData, data.blueprints[i]._id);
            }
        }).fail(() => {

        });
    });

    cu.Listen('HandleUploadBlueprint',(charid, blueprintname, celldata) => {
        serverAddress = cu.SecureApiUrl('api/blueprint/add');
        charID = charid;
        token = cuAPI.loginToken;
        $.ajax({
            type: 'GET',
            url: serverAddress,
            data: {
                newBlueprintName: blueprintname,
                newBlueprintData: celldata,
                characterID: charID,
                loginToken: token
            },
            contentType: 'application/octet-stream; charset=ascii',
            timeout: 10000
        }).done((data) => {
            cu.ReceiveBlueprintFromServer(data.name, data.cellData, data._id);
        }).fail(() => {

        });
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