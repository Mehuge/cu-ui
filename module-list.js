var UI = UI || {};
UI.Modules = {
    "character": { core: true },
    "chat": { core: true },
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
    "mehuge-lb": { core: false, autoLoad: true },
    "mehuge-heatmap": { core: false, autoLoad: true },
    "mehuge-perf": { core: false, autoLoad: true },
    "mehuge-pop": { core: false, autoLoad: true },
    "mehuge-bct": { core: false, autoLoad: true },
    "mehuge-announcer": { core: false, autoLoad: true },
    "mehuge-deathspam": { core: false, autoLoad: true },
    "mehuge-loc": { core: false, autoLoad: true },
    "mehuge-group": { core: false, autoLoad: true },
    "mehuge-combatlog": { core: false, autoLoad: true },
    "mehuge-pledges": { core: false },
    "g-castbar": { core: false, autoLoad: true },
    "ortu-compass": { core: false, autoLoad: true }
};
UI.Commands = [
    "vsync 1",
    "daytime 0"
];

// Autoexec (in offline mode)
UI.offline = {
    Modules: {
        "perfhud": { core: true, close: true },
        "minimap": { core: true, close: true },
        "mehuge-heatmap": { core: false, autoLoad: true },
        "mehuge-loc": { core: false, autoLoad: true }
},
    Commands: [
        "daytime 10",
        "fly 1"
    ]
}