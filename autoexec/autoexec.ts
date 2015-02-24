module Autoexec {
    var total, progress = 0, bar = document.getElementById("progress"), online = false;

    // Loads the named UI module.
    function OpenUI(name: string) {
        console.log('addons: loading ' + name + '.ui');
        try {
            if (name != "addons" && cuAPI != undefined) cuAPI.OpenUI(name + ".ui");
            return UI.Modules[name].loaded = true;
        } catch (e) {
            UI.Modules[name].loaded = false;
        }
    }

    // Loads the named UI module.
    function CloseUI(name: string) {
        console.log('addons: closing ' + name + '.ui');
        try {
            if (cuAPI != undefined) {
                cuAPI.CloseUI(name);
            }
            UI.Modules[name].loaded = false;
            return true;
        } catch (e) {
            console.warn('failed to close UI ' + JSON.stringify(e));
        }
    }

    function processCommands(cmds) {
        for (var i = 0; i < cmds.length; i++) {
            var parts = cmds[i].split(/;[ ]*/);
            for (var j = 0; j < parts.length; j++) {
                console.log("cmd " + parts[j]);
                cuAPI.ConsoleCommand(parts[j]);
            }
        }
    }

    function processUI(Modules, keys) {
        if (progress === 0) total = keys.length;
        var name = keys.shift();
        bar.style.backgroundSize = ((progress / total) * 100) + '% 100%';
        if (name) {
            var addon = Modules[name];
            if (addon.autoLoad) {
                console.log('open UI ' + name);
                cuAPI.OpenUI(name + ".ui");
            } else if (addon.close) {
                console.log('close UI ' + name);
                cuAPI.CloseUI(name);
            }
            progress++;
            setTimeout(function () {
                processUI(Modules, keys);
            }, 100);
        } else {
            cuAPI.CloseUI("autoexec");
        }
    }

    if (typeof cuAPI !== "undefined") {
        cuAPI.OnInitialized(() => {
            online = cuAPI.serverURL.length > 0;
            if (online) {
                processCommands(UI.Commands ? UI.Commands : []);
                processUI(UI.Modules, UI.Modules ? Object.keys(UI.Modules) : []);
            } else {
                if (UI.offline) {
                    processCommands(UI.offline.Commands ? UI.offline.Commands : []);
                    processUI(UI.offline.Modules, UI.offline.Modules ? Object.keys(UI.offline.Modules) : []);
                }
            }
        });
    }

}
 