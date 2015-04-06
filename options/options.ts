/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module Options {
    export var activeConfigIndex = Tags.KEYBIND;

    var $btnKeys = $('#btn-keys').addClass('active');
    var $btnInput = $('#btn-input');
    var $btnAudio = $('#btn-audio');
    var $btnApply = $('#btn-apply');
    var $btnSave = $('#btn-save');
    var $btnDefaults = $('#btn-defaults');
    var $btnCancel = $('#btn-cancel');
    var $btnSide = $('.btn-side');
    var $btnX = $('#btn-x');
    var cancel: any;

    cu.OnInitialized(() => {
        cu.GetConfigVars(activeConfigIndex);
    });

    $btnApply.click(() => {
        cuAPI.SaveConfigChanges();
    });

    $btnSave.click(() => {
        cuAPI.SaveConfigChanges();
        cuAPI.CloseUI('options');
    });

    $btnDefaults.click(() => {
        cuAPI.RestoreConfigDefaults(activeConfigIndex);
        cuAPI.GetConfigVars(activeConfigIndex);
    });

    cancel = () => {
        cuAPI.CancelAllConfigChanges(activeConfigIndex);
        cuAPI.CloseUI('options');
    };
    $btnCancel.click(cancel);
    $btnX.click(cancel);

    $btnKeys.click(() => {
        if (activeConfigIndex == Tags.KEYBIND) return;

        $btnSide.removeClass('active');
        $btnKeys.addClass('active');
        activeConfigIndex = Tags.KEYBIND;
        cu.GetConfigVars(activeConfigIndex);
    });

    $btnInput.click(() => {
        if (activeConfigIndex == Tags.INPUT) return;

        $btnSide.removeClass('active');
        $btnInput.addClass('active');
        activeConfigIndex = Tags.INPUT;
        cu.GetConfigVars(activeConfigIndex);
    });

    $btnAudio.click(() => {
        if (activeConfigIndex == Tags.AUDIO) return;

        $btnSide.removeClass('active');
        $btnAudio.addClass('active');
        activeConfigIndex = Tags.AUDIO;
        cu.GetConfigVars(activeConfigIndex);
    });
}

module KeyBindings {
    var $container = $('#binding-container');

    function handleKeyBind(item, value) {
        var $item = $('<div/>');
        $('<div/>').addClass('binding-name').text(item).appendTo($item);
        var $value = $('<div/>').addClass('binding-value').text(KeyCode.dxKeyCodeMap[value]).appendTo($item);
        $item.addClass('binding-item').click(() => {
            $value.text('Press a key');
            $(document).unbind('keyup').on('keyup', e => {
                var keyCodeValue = KeyCode.getKeyCodeValueFromEvent(e);
                if (keyCodeValue !== undefined) {
                    $(document).unbind('keyup');
                    cu.ChangeConfigVar(item, keyCodeValue.toString());
                    $value.text(KeyCode.dxKeyCodeMap[keyCodeValue]);
                }
            });
        }).appendTo($container);
    }

    cu.Listen('HandleReceiveConfigVars', configs => {
        if (configs && Options.activeConfigIndex == Tags.KEYBIND) {
            configs = $.parseJSON(configs);

            $container.empty();
            for (var item in configs) {
                handleKeyBind(item, configs[item]);
            }
        }
    });
}

module Input {
    var $container = $('#binding-container');

    function handleBool(item, value) {
        var $item = $('<div/>');
        $('<div/>').addClass('binding-name').text(item).appendTo($item);
        var text = value == 'true' ? 'Enabled' : 'Disabled';
        var $value = $('<div/>').addClass('binding-value').text(text).appendTo($item);
        $item.addClass('binding-item').click(() => {
            value = value == 'true' ? 'false' : 'true';
            cu.ChangeConfigVar(item, value);
            $value.text((value == 'true') ? 'Enabled' : 'Disabled');
        }).appendTo($container);
    }

    cu.Listen('HandleReceiveConfigVars', configs => {
        if (configs && Options.activeConfigIndex == Tags.INPUT) {
            configs = $.parseJSON(configs);

            $container.empty();
            for (var item in configs) {
                handleBool(item, configs[item]);
            }
        }
    });
}

module AudioOptions {
    var $container = $('#binding-container');

    function handleBool(item, value) {
        var $item = $('<div/>');
        $('<div/>').addClass('binding-name').text(item).appendTo($item);
        var text = value == 'true' ? 'Yes' : 'No';
        var $value = $('<div/>').addClass('binding-value').text(text).appendTo($item);
        $item.addClass('binding-item').click(() => {
            value = value == 'true' ? 'false' : 'true';
            cu.ChangeConfigVar(item, value);
            $value.text((value == 'true') ? 'Yes' : 'No');
        }).appendTo($container);
    }

    function handleVolume(item, value) {
        var $item = $('<div/>');
        $('<div/>').addClass('binding-name').text(item).appendTo($item);

        var $slider = $('<div class="binding-item"/>');

        $slider.slider({
            value: value,
            stop: (e, ui) => {
                value = ui.value;
                cu.ChangeConfigVar(item, value);
            }
        }).appendTo($item);

        $item.appendTo($container);

    }

    cu.Listen('HandleReceiveConfigVars', configs => {
        if (configs && Options.activeConfigIndex == Tags.AUDIO) {
            configs = $.parseJSON(configs);

            $container.empty();
            for (var item in configs) {
                if (item === 'Mute Volume') {
                    handleBool(item, configs[item]);
                } else {
                    handleVolume(item, configs[item]);
                }
            }
        }
    });
}