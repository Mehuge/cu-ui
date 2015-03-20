var UI = UI || {};
UI.Modules = {
    "character": { core: true },
    "chat": { core: true, close: true },
    "errormessages": { core: true },
    "kills": { core: true },
    "login": { core: true },
    "perfhud": { core: true },
    "respawn": { core: true },
    "skillbar": { core: true },
    "target": { core: true },
    "options": { core: true },
    "equippedgear": { core: true },
    "inventory": { core: true },
    // custom-ui's go below...
    "mehuge-chat": { core: false, autoLoad: true },
};

// Autoexec (in offline mode)
UI.offline = {
    Modules: {
        "perfhud": { core: true, close: true },
        "minimap": { core: true, close: true },
        "mehuge-heatmap": { core: false, autoLoad: true },
    },
    Commands: [
        "daytime 10",
        "fly 1"
    ]
}