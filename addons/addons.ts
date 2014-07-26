/// <reference path="../vendor/jquery.d.ts" />
/// <reference path="../module-list.d.ts" />
module Addons {

    var ml: JQuery = $('#moduleList');
    var modules = UI.Modules;

    // Loads the named UI module.
    function OpenUI(name) {
        console.log('addons: loading ' + name + '.ui');
        try {
            if (name != "addons" && cuAPI != undefined) cuAPI.OpenUI(name + ".ui");
            modules[name].loaded = true;
        } catch (e) {
            modules[name].loaded = false;
        }
    }
 
    // Initialise the UI (module list) and auto-load any modules marked as autoLoad true
    function _init() {
        if (ml) {
            var html = '<table><tr><th>Name</th><th>Core</th><th>Loaded</th>';
            for (var name in modules) {
                var addon = modules[name];
                if (addon.autoLoad) {
                    OpenUI(name);
                }
                html += '<tr id="'+name+'">'
                + '<td>' + name + '</td>'
                + '<td>' + (addon.core ? '&#x2714;' : '') + '</td>'
                + '<td>' + (addon.core||addon.loaded ? '&#x2714;' : '') + '</td>'
                + '</tr>';
            }
            html += '</html>';
            ml.append(html);

            // close the UI
            document.getElementById("close").onclick = () => {
                Hide();
            };

            // Attach event listeners to the buttons.
            ml.find('tr').each((index: number, elem: Element) => {
                elem.addEventListener("click", (ev: PointerEvent) => {
                    var name = elem.getAttribute("id"),
                        el: JQuery = $(elem).find('td:last-child'),
                        text = el.text();
                    if (name && text === "") {
                        OpenUI(name);
                        if (modules[name].loaded) el.html('&#x2714;');
                    } else {
                        alert('CloseUI not yet supported');
                    }
                });
            });
        }
        Show();
    };
 
    // Show the addons UI
    function Show() {
        document.body.style.display = 'block';
    };

    // Hide the addons UI
    function Hide() {
        document.body.style.display = 'none';
    }
 
    // Initialise
    _init();
};
