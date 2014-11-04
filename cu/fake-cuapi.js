var Events = (function () {
    function Events() {
        this.listeners = {};
    }
    Events.prototype.hasListener = function (eventName) {
        return events.listeners.hasOwnProperty(eventName);
    };

    Events.prototype.listen = function (eventName, c) {
        if (!this.hasListener(eventName)) {
            events.listeners[eventName] = [];
        }

        return events.listeners[eventName].push(c) - 1;
    };

    Events.prototype.ignore = function (eventName, c) {
        if (this.hasListener(eventName)) {
            delete events.listeners[eventName][c];
        }
    };

    Events.prototype.fire = function (eventName) {
        var args = [];
        for (var _i = 0; _i < (arguments.length - 1); _i++) {
            args[_i] = arguments[_i + 1];
        }
        if (this.hasListener(eventName)) {
            events.listeners[eventName].forEach(function (listener) {
                listener.apply(this, args);
            });
        }
    };
    return Events;
})();

var events = new Events();

function pad(n, width, z) {
    if (typeof z === "undefined") { z = ''; }
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

var fakeAbilityNumbers = [];

for (var i = 1; i <= 10; i++) {
    fakeAbilityNumbers.push(pad(i, 16));
}

var FakeCUInGameAPI = (function () {
    function FakeCUInGameAPI() {
        this.initialized = true;
        this.serverTime = 0;
        this.serverURL = 'http://chat.camelotunchained.com:8000/api/';
        /* Abilities */
        this.abilityNumbers = fakeAbilityNumbers;
        /* Items */
        this.inventoryItemIDs = [];
        this.gearItemIDs = [];
        /* Character */
        this.pktHash = '';
        this.loginToken = '';
        this.characterName = 'Player';
        this.characterID = '';
        this.faction = 0;
        this.race = 0;
        // this.hp = 100;
        this.__defineGetter__("hp", function() { return (Math.random()*101)|0; });
        this.maxHP = 120;
        this.energy = 0;
        this.maxEnergy = 0;
        this.speed = 0;
        this.selfEffects = '[]';
        this.locationX = 0;
        this.locationY = 0;
        this.locationZ = 0;
        /* Target */
        this.targetName = '';
        this.targetHP = 0;
        this.targetMaxHP = 0;
        this.targetEnergy = 0;
        this.targetMaxEnergy = 0;
        this.targetEffects = '';
        this.isTargetFriendly = false;
        /* Stats */
        this.fps = 0;
        this.frameTime = 0;
        this.netstats_udpPackets = 0;
        this.netstats_udpBytes = 0;
        this.netstats_tcpMessages = 0;
        this.netstats_tcpBytes = 0;
        this.netstats_players_updateBits = 0;
        this.netstats_players_updateCount = 0;
        this.netstats_players_newCount = 0;
        this.netstats_players_newBits = 0;
        this.netstats_lag = 0;
        this.particlesRenderedCount = 0;
        /* Other */
        this.vsync = 0;
    }
    FakeCUInGameAPI.prototype.OnInitialized = function (c) {
        return events.listen('OnInitialized', c);
    };

    FakeCUInGameAPI.prototype.CancelOnInitialized = function (c) {
        events.ignore('OnInitialized', c);
    };

    FakeCUInGameAPI.prototype.OnServerConnected = function (c) {
        return events.listen('OnServerConnected', c);
    };

    FakeCUInGameAPI.prototype.CancelOnServerConnected = function (c) {
        events.ignore('OnServerConnected', c);
    };

    FakeCUInGameAPI.prototype.Attack = function (abilityID) {
    };

    FakeCUInGameAPI.prototype.OnAbilityCooldown = function (c) {
        return events.listen('OnAbilityCooldown', c);
    };

    FakeCUInGameAPI.prototype.CancelOnAbilityCooldown = function (c) {
        events.ignore('OnAbilityCooldown', c);
    };

    FakeCUInGameAPI.prototype.OnAbilityActive = function (c) {
        return events.listen('OnAbilityActive', c);
    };

    FakeCUInGameAPI.prototype.CancelOnAbilityActive = function (c) {
        events.ignore('OnAbilityActive', c);
    };

    FakeCUInGameAPI.prototype.OnAbilityError = function (c) {
        events.listen('OnAbilityError', c);
    };

    FakeCUInGameAPI.prototype.EquipItem = function (itemID) {
        var index = this.inventoryItemIDs.indexOf(itemID);
        if (index !== -1) {
            this.inventoryItemIDs.splice(index, 1);
        }
        events.fire('OnItemEquipped', itemID);
    };

    FakeCUInGameAPI.prototype.OnItemEquipped = function (callback) {
        events.listen('OnItemEquipped', callback);
    };

    FakeCUInGameAPI.prototype.UnequipItem = function (itemID) {
        this.inventoryItemIDs.push(itemID);
        events.fire('OnItemUnequipped', itemID);
    };

    FakeCUInGameAPI.prototype.OnItemUnequipped = function (callback) {
        events.listen('OnItemUnequipped', callback);
    };

    FakeCUInGameAPI.prototype.GetItem = function (itemID) {
        // TODO: return complete item
        events.fire('OnGetItem', itemID, JSON.stringify({ itemID: itemID, name: 'Item ' + itemID }));
    };

    FakeCUInGameAPI.prototype.OnGetItem = function (callback) {
        events.listen('OnGetItem', callback);
    };

    /* Config */
    FakeCUInGameAPI.prototype.OnReceiveConfigVars = function (c) {
        events.listen('OnReceiveConfigVars', c);
    };

    FakeCUInGameAPI.prototype.OnReceiveConfigVar = function (c) {
        events.listen('OnReceiveConfigVar', c);
    };

    FakeCUInGameAPI.prototype.OnConfigVarChanged = function (c) {
        events.listen('OnConfigVarChanged', c);
    };

    FakeCUInGameAPI.prototype.SaveConfigChanges = function () {
        events.fire('OnSavedConfigChanges');
    };

    FakeCUInGameAPI.prototype.OnSavedConfigChanges = function (c) {
        events.listen('OnSavedConfigChanges', c);
    };

    FakeCUInGameAPI.prototype.RestoreConfigDefaults = function (tag) {
        events.fire('RestoreConfigDefaults', tag);
    };

    FakeCUInGameAPI.prototype.ChangeConfigVar = function (variable, value) {
        events.fire('ChangeConfigVar', variable, value);
    };

    FakeCUInGameAPI.prototype.CancelChangeConfig = function (variable) {
        events.fire('CancelChangeConfig', variable);
    };

    FakeCUInGameAPI.prototype.CancelAllConfigChanges = function (tag) {
        events.fire('CancelAllConfigChanges', tag);
    };

    FakeCUInGameAPI.prototype.GetConfigVars = function (tag) {
        events.fire('OnReceiveConfigVars', tag);
    };

    FakeCUInGameAPI.prototype.GetConfigVar = function (variable) {
        var configVar = {};
        configVar[variable] = 0x2C;
        setTimeout(function () {
            events.fire('OnReceiveConfigVar', configVar);
        }, 0);
    };

    /* Announcement */
    FakeCUInGameAPI.prototype.OnAnnouncement = function (c) {
        events.listen('OnAnnouncement', c);
    };

    /* Chat */
    FakeCUInGameAPI.prototype.OnBeginChat = function (c) {
        events.listen('OnBeginChat', c);
    };

    FakeCUInGameAPI.prototype.OnChat = function (c) {
        events.listen('OnChat', c);
    };

    FakeCUInGameAPI.prototype.SendChat = function (type, to, body) {
        // TODO: from? nick? iscse?
        events.fire('OnChat', type, '_global@chat.camelotunchained.com', body, 'Player', false);
    };

    FakeCUInGameAPI.prototype.JoinMUC = function (room) {
        events.fire('JoinMUC', room);
    };

    FakeCUInGameAPI.prototype.LeaveMUC = function (room) {
        events.fire('LeaveMUC', room);
    };

    FakeCUInGameAPI.prototype.Stuck = function () {
        events.fire('Stuck');
    };

    FakeCUInGameAPI.prototype.ChangeZone = function (zoneID) {
        events.fire('ChangeZone', zoneID);
    };

    /* Console */
    FakeCUInGameAPI.prototype.OnConsoleText = function (c) {
        events.listen('OnConsoleText', c);
    };

    FakeCUInGameAPI.prototype.ConsoleCommand = function (body) {
        events.fire('OnConsoleText', body);
    };

    FakeCUInGameAPI.prototype.Connect = function (host, character) {
        events.fire('Connect', host, character);
    };

    /* Shared */
    FakeCUInGameAPI.prototype.OpenUI = function (name) {
        events.fire('OpenUI', name);
    };

    FakeCUInGameAPI.prototype.CloseUI = function (name) {
        events.fire('CloseUI', name);
    };

    FakeCUInGameAPI.prototype.HideUI = function (name) {
        events.fire('HideUI', name);
    };

    FakeCUInGameAPI.prototype.ShowUI = function (name) {
        events.fire('ShowUI', name);
    };

    FakeCUInGameAPI.prototype.ToggleUIVisibility = function (name) {
        events.fire('ToggleUIVisibility', name);
    };

    FakeCUInGameAPI.prototype.RequestInputOwnership = function () {
        events.fire('RequestInputOwnership');
    };

    FakeCUInGameAPI.prototype.ReleaseInputOwnership = function () {
        events.fire('ReleaseInputOwnership');
    };

    FakeCUInGameAPI.prototype.Quit = function () {
        events.fire('Quit');
    };

    FakeCUInGameAPI.prototype.CrashTheGame = function () {
        events.fire('CrashTheGame');
    };

    FakeCUInGameAPI.prototype.OnUpdateNameplate = function (c) {
        events.listen('OnUpdateNameplate', c);
    };
    return FakeCUInGameAPI;
})();

if (typeof cuAPI === "undefined") {
    var cuAPI = new FakeCUInGameAPI();
    window.onload = function () {
        events.fire('OnServerConnected');
    };
}