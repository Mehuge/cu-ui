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
    "lb": { core: false, autoLoad: true },
    "heatmap": { core: false, autoLoad: true },
    "perf": { core: false, autoLoad: true },
    "pop": { core: false, autoLoad: true },
    "bct": { core: false, autoLoad: true },
    "announcer": { core: false, autoLoad: true },
    "deathspam": { core: false, autoLoad: true },
    "compass": { core: false, autoLoad: true },
    "loc": { core: false, autoLoad: true },
    "pledges": { core: false }
};
UI.Commands = [
    "vsync 1",
    "daytime 0"
];