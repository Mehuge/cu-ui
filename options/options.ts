/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module KeyBindings {
    var $container = $('#binding-container');

    function handleKeyBind(item, value) {
        var $item = $('<div/>');
        $('<div/>').addClass('binding-name').text(item).appendTo($item);
        var $value = $('<div/>').addClass('binding-value').text(KeyCode.dxKeyCodeMap[value]).appendTo($item);
        $item.addClass('binding-item').click(() => {
            $value.text('Press a key');
            $(document).unbind('keyup').on('keyup', e => {
                $(document).unbind('keyup');
                var keyCodeValue = KeyCode.getKeyCodeValueFromEvent(e);
                cu.ChangeConfigVar(item, keyCodeValue.toString());
                $value.text(KeyCode.dxKeyCodeMap[keyCodeValue]);
            });
        }).appendTo($container);
    }

    cu.Listen('HandleReceiveConfigVars', configs => {
        if (configs) {
            configs = $.parseJSON(configs);

            $container.empty();
            for (var item in configs) {
                handleKeyBind(item, configs[item]);
            }
        }
    });

    cu.OnInitialized(() => {
        cu.GetConfigVars(Tags.KEYBIND);
    });

    $('#btn-apply').click(() => {
        cuAPI.SaveConfigChanges();
    });

    $('#btn-save').click(() => {
        cuAPI.SaveConfigChanges();
        cuAPI.CloseUI('options');
    });

    $('#btn-defaults').click(() => {
        cuAPI.RestoreConfigDefaults(Tags.KEYBIND);
        cuAPI.GetConfigVars(Tags.KEYBIND);
    });

    $('#btn-cancel').click(() => {
        cuAPI.CancelAllConfigChanges(Tags.KEYBIND);
        cuAPI.CloseUI('options');
    });
}
