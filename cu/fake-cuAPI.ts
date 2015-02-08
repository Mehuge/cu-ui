/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/// <reference path="../vendor/jquery.d.ts" />

class CUFakeGameAPI {

    private rand(n): number {
        return (Math.random() * n) | 0;
    }

    private Race = {
        Tuatha: 0,
        Hamadryad: 1,
        Luchorpan: 2,
        Firbog: 3,
        Valkyrie: 4,
        Helbound: 5,
        FrostGiant: 6,
        Dvergr: 7,
        Strm: 8,
        CaitSith: 9,
        Golem: 10,
        Gargoyle: 11,
        StormRiderA: 12,
        StormRiderT: 13,
        StormRiderV: 14
    }

    private _initialised: boolean = false;
    private _events: any = {};
    private _token: string;
    private _serverStart: number = Date.now();
    private _clientType: string = "internal";
    private _openUIs: any = {};
    private _buildingMode: boolean = false;

    // simulate character/player data
    private _character = {
        name: undefined, race: undefined, hpTouched: Date.now(), hp: 100, maxHP: 100, staminaTouched: Date.now(), stamina: 0, maxStamina: 100
    };
    private _target = {
        name: undefined, race: undefined, hpTouched: Date.now(), hp: 100, maxHP: 100, staminaTouched: Date.now(), stamina: 0, maxStamina: 100
    };
    private _friendly = {
        name: undefined, race: undefined, hpTouched: Date.now(), hp: 100, maxHP: 100, staminaTouched: Date.now(), stamina: 0, maxStamina: 100
    };

    private _ev(name: string, c : any): number {
        var a = this._events[name] || [];
        this._events[name] = a;
        return a.push(c);
    }

    private _evc(name: string, c: number): void {
        var a = this._events[name];
        if (a) {
            a[c] = null;
        }
    }
    private _evf(name: string, args: any): void {
        var a = this._events[name];
        if (a) {
            for (var i = 0; i < a.length; i++) {
                if (a[i]) {
                    (function (callback) {
                        setTimeout(function () {
                            callback.apply(window, args);
                        }, 0);
                    })(a[i]);
                }
            }
        }
    }

    private _init(c: () => void) : number {
        this._initialised = true;
        var cuAPI: CUFakeGameAPI = this;

        function _randomCharacter(): string {
            return ["Player1"][cuAPI.rand(1)];
        }

        function _randomPlayer(): string {
            return ["CSE_Mark", "CSE_JB", "CSE_Brian", "CSE_Bryce", "DonnieT", "Meddyck", "CSE_Jenesee", "Mehuge", "CSE_Cory", "CSE_Tyler" ][cuAPI.rand(10)];
        }

        function _changeCharacter(tick, _player) {
            _player.name = _randomCharacter();
            cuAPI._evf("OnCharacterNameChanged", [_player.name]);
            _player.race = cuAPI.rand(15) | 0;
            cuAPI._evf("OnCharacterRaceChanged", [_player.race]);
        }

        function _changeTarget(tick, _player) {
            _player.name = _randomPlayer();
            cuAPI._evf("OnTargetNameChanged", [_player.name]);
        }

        function _changeFriendlyTarget(tick, _player) {
            _player.name = _randomPlayer();
            cuAPI._evf("OnFriendlyTargetNameChanged", [_player.name]);
        }

        function _playerTick(tick, cls, _player) {
            // Fire character name change if not currently got a name
            if (!_player.name) {
                if (_player === cuAPI._character) {
                    _changeCharacter(tick, _player);
                } else if (_player === cuAPI._target) {
                    _changeTarget(tick, _player);
                } else if (_player === cuAPI._target) {
                    _changeFriendlyTarget(tick, _player);
                }
            }

            // Character health emulation.  We want to do this infrequently, so here
            // we are saying between 0.5 and 1s appart.
            if (tick - _player.hpTouched >= cuAPI.rand(500) + 500) {

                // player takes damage?
                if (_player.hp > 0 && cuAPI.rand(10) < 5) {
                    _player.hp -= 1 + cuAPI.rand(30);
                    _player.hpTouched = tick;
                    if (_player.hp < 0) {
                        _player.hp = 0;
                    }
                    cuAPI._evf("On" + cls +"HealthChanged", [_player.hp, _player.maxHP]);
                    if (_player.hp === 0) {
                        cuAPI._evf("OnChat", [
                            XmppMessageType.GROUPCHAT,
                            "_combat@chat.camelotunchained.com",
                            (cuAPI.rand(10) < 1 ? cuAPI._character.name : _randomPlayer()) + " killed " + _player.name + ".",
                            "", false
                        ]);
                    }
                }

                // Character is healed?
                if (_player.hp < _player.maxHP && cuAPI.rand(10) < 2) {
                    _player.hp += 1 + cuAPI.rand(30);
                    _player.hpTouched = tick;
                    if (_player.hp > _player.maxHP) {
                        _player.hp = _player.maxHP;
                    }
                    cuAPI._evf("On" + cls +"HealthChanged", [_player.hp, _player.maxHP]);
                }
            }

            // Character stamina emulation.  Again only change this ever 0.5s to 1s
            if (tick - _player.hpTouched >= cuAPI.rand(500) + 500) {

                // Character stamina emulation
                if (_player.stamina > 0 && cuAPI.rand(10) < 5) {
                    _player.stamina -= 1 + cuAPI.rand(10);
                    _player.staminaTouched = tick;
                    if (_player.stamina < 0) {
                        _player.stamina = 0;
                    }
                    cuAPI._evf("On" + cls + "StaminaChanged", [_player.stamina, _player.maxStamina]);
                }

                // Character is healed?
                if (_player.stamina < _player.maxStamina && cuAPI.rand(10) < 2) {
                    _player.stamina += 1 + cuAPI.rand(30);
                    _player.staminaTouched = tick;
                    if (_player.stamina > _player.maxStamina) {
                        _player.stamina = _player.maxStamina;
                    }
                    cuAPI._evf("On" + cls + "StaminaChanged", [_player.stamina, _player.maxStamina]);
                }
            }
        }

        function _tick() {
            var tick: number = Date.now();
            // emulation tick, here we will simulate the live environment (as much as we can) in the UI.  
            // We will adjust HP, targets etc.
            _playerTick(tick, "Character", cuAPI._character);
            _playerTick(tick, "Target", cuAPI._target);
            _playerTick(tick, "FriendlyTarget", cuAPI._friendly);
        }
        setInterval(_tick, 100);
        return setTimeout(c, 0);
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////////

    // These are the only things that are guaranteed to exist from the time
    // the page is created. Everything else will be constructed over the course
    // of the client's setup, concurrent to the page load and inital script
    // execution. Anything you need to do in setup should be attached to
    // cu.OnInitialized(), which will be called after the page is loaded
    // and this is fully set up.
    get initialised():boolean {
        return this._initialised;
    }
    OnInitialized(c: () => void) : number {
        return this._init(c);
    }
    CancelOnInitialized(c: number) {
        clearTimeout(c);
    }

    // Everything else only exists after this.initialized is set and the
    // OnInitialized callbacks are invoked.

    /* Shared */

    // Called by the client when a connection to a server is established
    OnServerConnected(c: (isConnected: boolean) => void): number {
        return this._ev("OnServerConnected", c);
    }
    CancelOnServerConnected(c: number): void {
        this._evc("OnServerConnected", c);
    }

    // Returns the users login token provided by the patcher.  Under fake-cuAPI conditions we wont have
    // one of this, it is up to the user to determine and proved a valid one (by for example looking
    // at the command line of the main client exe spawned by the patcher)
    get loginToken(): string {
        if (!this._token) this._token = window.prompt("Login Token?");
        return this._token;
    }

    // Resource channel used to communicate with the patcher
    get patchResourceChannel(): number {
        switch (this._clientType) {
            case "internal": return 4;
            case "alpha": return 10;
        }
        return;
    }

    // something to do with the network
    get pktHash(): string {
        return "yOP5gKif0zt2u4FoZ8xQ27";
    }

    // The URL for the REST API for this server
    get serverURL(): string {
        switch (this._clientType) {
            case "alpha":
                return "http://wyrmling.camelotunchained.com:8000/api/";
        }
        return "http://chat.camelotunchained.com:8000/api/";
    }

    // Current server time seconds
    get serverTime(): number {
        return (Date.now() - this._serverStart) / 1000;
    }

    // Returns true if vsync is on, otherwise false.
    get vsync(): boolean {
        return true;
    }

    // Open another UI.  Limitation in fake-cuAPI is that the UI must follow
    // a standard layout and it doesn't currentl support the .ui file coordinates
    OpenUI(name: string): void {
        if (name.substr(-3) == ".ui") name = name.substr(0, name.length - 3);
        this._openUIs[name] = { window: window.open("../" + name + "/" + name + ".html", "_ui" + name, "", true), visible: true };
    }

    CloseUI(name: string): void {
        var ui: any = this._openUIs[name];
        if (ui) {
            ui.window.close();
            this._openUIs[name] = null;
        }
    }

    HideUI(name: string): void {
        var ui: any = this._openUIs[name];
        ui.size = { w: ui.window.innerWidth, h: ui.window.innerHeight };
        ui.window.resizeTo(0, 0);
        ui.false = true;
    }

    ShowUI(name: string): void {
        var ui: any = this._openUIs[name];
        ui.window.resizeTo(ui.size.w, ui.size.h);
        ui.visible = true;
    }

    ToggleUIVisibility(name: string): void {
        var ui: any = this._openUIs[name];
        if (ui.visible) {
            cuAPI.HideUI(name);
        } else {
            cuAPI.ShowUI(name);
        }
    }

    RequestInputOwnership(): void { }
    ReleaseInputOwnership(): void { }
    Quit(): void { }
    CrashTheGame(): void { alert('The game has crashed'); }
    OnUpdateNameplate(c: (cell: number, colorMod: number, name: string, gtag: string, title: string) => void): void {
        this._ev("OnUpdateNameplate", c);
    }

    /* Abilities */

    OnAbilityNumbersChanged(callback: (abilityNumbers: string[]) => void): void {
    }

    Attack(abilityID: string): void {
    }

    OnAbilityCooldown(c: (cooldownID: number, timeStarted: number, duration: number) => void): number {
        return 0;
    }
    CancelOnAbilityCooldown(c: number): void {
    }

    OnAbilityActive(c: (currentAbility: string, timeStarted: number, timeTriggered: number, queuedAbility: string) => void): number {
        return this._ev("OnAbilityActive", c);
    }
    CancelOnAbilityActive(c: number): void { }

    OnAbilityError(c: (message: string) => void): void { }

    /* Items */

    GetItem(itemID: string): void {}
    OnGetItem(callback: (itemID: string, data: string) => void): void { }

    OnItemEquipped(callback: (itemID: string) => void): void {}
    OnItemUnequipped(callback: (itemID: string) => void): void {}

    /* Equipped Gear */

    OnEquippedGearItemIDsChanged(callback: (gearItemIDs: string[]) => void): void {}

    UnequipItem(itemID: string): void {}

    /* Inventory */

    OnInventoryItemIDsChanged(callback: (inventoryItemIDs: string[]) => void): void {}

    EquipItem(itemID: string): void {}

    /* Config */

    OnReceiveConfigVars(c: (configs: string) => void): void {}
    OnReceiveConfigVar(c: (config: any) => void): void {}
    OnConfigVarChanged(c: (isChangeSuccessful: boolean) => void): void {}
    SaveConfigChanges(): void {}
    OnSavedConfigChanges(c: () => void): void {}
    RestoreConfigDefaults(tag: Tags): void {}
    ChangeConfigVar(variable: string, value: string): void {}
    CancelChangeConfig(variable: string): void {}
    CancelAllConfigChanges(tag: Tags): void {}
    GetConfigVars(tag: Tags): void {}
    GetConfigVar(variable: string): void {}

    /* Building */
    OnBuildingModeChanged(c: (buildingMode: boolean) => void): void {
        this._ev("OnBuildingModeChanged", c);
    }
    ChangeBuildingMode(): void {
        this._buildingMode = !this._buildingMode;
        this._evf("OnBuildingModeChanged", [ this._buildingMode ]);
    }

    /* Announcement */
    OnAnnouncement(c: (message: string, type: number) => void): void {
        this._ev("OnAnnouncement", c);
    }

    /* Character */
    OnCharacterIDChanged(c: (id: string) => void): void {
        this._ev("OnCharacterIDChanged", c);
    }
    OnCharacterFactionChanged(c: (faction: number) => void): void {
        this._ev("OnCharacterFactionChanged", c);
    }
    OnCharacterRaceChanged(c: (race: number) => void): void {
        var id: string = "OnCharacterRaceChanged";
        this._ev(id, c);
        if (this._character.race !== undefined) {
            this._evf(id, [this._character.name]);
        }
    }
    OnCharacterNameChanged(c: (name: string) => void): void {
        var id: string = "OnCharacterNameChanged";
        this._ev(id, c);
        if (this._character.name !== undefined) {
            this._evf(id, [this._character.name]);
        }
    }
    OnCharacterHealthChanged(c: (health: number, maxHealth: number) => void): void {
        var id : string = "OnCharacterHealthChanged";
        this._ev(id, c);
        this._evf(id, [this._character.hp, this._character.maxHP]);
    }
    OnCharacterStaminaChanged(c: (stamina: number, maxStamina: number) => void): void {
        var id: string = "OnCharacterStaminaChanged";
        this._ev(id, c);
        this._evf(id, [this._character.stamina, this._character.maxStamina]);
    }
    OnCharacterEffectsChanged(c: (effects: string) => void): void {}

    /* Enemy Target */

    OnEnemyTargetNameChanged(callback: (name: string) => void): void {
        var id: string = "OnTargetNameChanged";
        this._ev(id, callback);
        if (this._target.name !== undefined) {
            this._evf(id, [this._target.name]);
        }
    }
    OnEnemyTargetHealthChanged(callback: (health: number, maxHealth: number) => void): void {
        var id: string = "OnTargetHealthChanged";
        this._ev(id, callback);
        this._evf(id, [this._target.hp, this._target.maxHP]);
    }
    OnEnemyTargetStaminaChanged(callback: (stamina: number, maxStamina: number) => void): void {
        var id: string = "OnTargetStaminaChanged";
        this._ev(id, callback);
        this._evf(id, [this._target.stamina, this._target.maxStamina]);
    }
    OnEnemyTargetEffectsChanged(callback: (effects: string) => void): void {}

    /* Friendly Target */

    OnFriendlyTargetNameChanged(callback: (name: string) => void): void {
        var id: string = "OnFriendlytTargetNameChanged";
        this._ev(id, callback);
        if (this._friendly.name) {
            this._evf(id, [this._friendly.name]);
        }
    }
    OnFriendlyTargetHealthChanged(callback: (health: number, maxHealth: number) => void): void {
        var id: string = "OnFriendlyTargetHealthChanged";
        this._ev(id, callback);
        this._evf(id, [this._friendly.hp, this._friendly.maxHP]);
    }
    OnFriendlyTargetStaminaChanged(callback: (stamina: number, maxStamina: number) => void): void {
        var id: string = "OnFriendlyTargetStaminaChanged";
        this._ev(id, callback);
        this._evf(id, [this._friendly.stamina, this._friendly.maxStamina]);
    }
    OnFriendlyTargetEffectsChanged(callback: (effects: string) => void): void {}

    /* Chat */

    OnBeginChat(c: (commandMode: number, text: string) => void): void {
        this._ev("OnBeginChat", c);
    }
    OnChat(c: (type: number, from: string, body: string, nick: string, iscse: boolean) => void): void {
        this._ev("OnChat", c);
    }
    SendChat(type: number, to: string, body: string): void {}
    JoinMUC(room: string): void {}
    LeaveMUC(room: string): void {}
    Stuck(): void {}
    ChangeZone(zoneID: number): void {}

    /* Stats */

    get fps(): number { return 60; }
    get frameTime(): number { return 16.7; }
    get netstats_udpPackets(): number { return 100; }
    get netstats_udpBytes(): number { return 1000; }
    get netstats_tcpMessages(): number { return 10; }
    get netstats_tcpBytes(): number { return 3000; }

    get netstats_players_updateBits(): number {
        return 0;
    }

    get netstats_players_updateCount(): number {
        return 0;
    }

    get netstats_players_newCount(): number {
        return 0;
    }

    get netstats_players_newBits(): number {
        return 0;
    }

    get netstats_lag(): number {
        return 125;
    }

    get particlesRenderedCount(): number {
        return this.rand(10000);
    }

    get speed(): number {
        return 0;               // stopped
    }

    get locationX(): number {
        return 0;
    }

    get locationY(): number {
        return 0;
    }

    get location(): number {
        return 0;
    }

    get characters(): number {
        return 0;
    }
    get terrain(): number {
        return 0;
    }

    get perfHUD(): string {
        return "";
    }

    /* Console */

    OnConsoleText(c: (text: string) => void): void {}
    ConsoleCommand(body: string): void {}

    /* Login */

    Connect(host: string, port: string, character: string, webAPIHost: string): void {}
}

declare var cuAPI: CUInGameAPI;

if (typeof cuAPI === "undefined") {
    window["cuAPI"] = new CUFakeGameAPI();
    window.addEventListener("load", () => { document.body.style.background = '#808080 url("../cu/fake-cuAPI.jpg") no-repeat fixed center'; });
}
