/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/// <reference path="../vendor/jquery.d.ts" />

class CUFakeGameAPI {
    private rand(n): number {
        return (Math.random() * n) | 0;
    }

    private _initialised: boolean = false;
    private _events: any = {};
    private _token: string;
    private _serverStart: number = Date.now();
    private _clientType: string = "internal";
    private _openUIs: any = {};

    // simulate character
    private _character = { name: undefined, hpTouched: Date.now(), hp: 100, maxHP: 100, staminaTouched: Date.now(), stamina: 0, maxStamina: 100 };

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
        function _tick() {
            var tick: number = Date.now();
            if (!cuAPI._character.name) {
                cuAPI._character.name = "Mehuge";
                cuAPI._evf("OnCharacterNameChange", [cuAPI._character.name ]);
            }
            // emulation tick, here we will simulate the live environment (as much as we can) in the UI.  
            // We will adjust HP, targets etc.

            // Character health emulation
            if (tick - cuAPI._character.hpTouched >= cuAPI.rand(500)+500) {
    
                // Character takes damage?
                if (cuAPI._character.hp > 0 && cuAPI.rand(10) < 5) {
                    cuAPI._character.hp -= 1 + cuAPI.rand(30);
                    cuAPI._character.hpTouched = tick;
                    if (cuAPI._character.hp < 0) {
                        cuAPI._character.hp = 0;
                    }
                    cuAPI._evf("OnCharacterHealthChanged", [cuAPI._character.hp, cuAPI._character.maxHP]);
                    if (cuAPI._character.hp === 0) {
                        cuAPI._evf("OnChat", [
                            XmppMessageType.GROUPCHAT,
                            "_combat@chat.camelotunchained.com",
                            cuAPI._character.name + " killed " + cuAPI._character.name + ".",
                            "", false
                        ]);
                    }
                }

                // Character is healed?
                if (cuAPI._character.hp < cuAPI._character.maxHP && cuAPI.rand(10) < 2) {
                    cuAPI._character.hp += 1 + cuAPI.rand(30);
                    cuAPI._character.hpTouched = tick;
                    if (cuAPI._character.hp > cuAPI._character.maxHP) {
                        cuAPI._character.hp = cuAPI._character.maxHP;
                    }
                    cuAPI._evf("OnCharacterHealthChanged", [cuAPI._character.hp, cuAPI._character.maxHP]);
                }
            }

            // Character health emulation
            if (tick - cuAPI._character.hpTouched >= cuAPI.rand(500) + 500) {

                // Character stamina emulation
                if (cuAPI._character.stamina > 0 && cuAPI.rand(10) < 5) {
                    cuAPI._character.stamina -= 1 + cuAPI.rand(10);
                    cuAPI._character.staminaTouched = tick;
                    if (cuAPI._character.stamina < 0) {
                        cuAPI._character.stamina = 0;
                    }
                    cuAPI._evf("OnCharacterStaminaChanged", [cuAPI._character.stamina, cuAPI._character.maxStamina]);
                }

                // Character is healed?
                if (cuAPI._character.stamina < cuAPI._character.maxStamina && cuAPI.rand(10) < 2) {
                    cuAPI._character.stamina += 1 + cuAPI.rand(30);
                    cuAPI._character.staminaTouched = tick;
                    if (cuAPI._character.stamina > cuAPI._character.maxStamina) {
                        cuAPI._character.stamina = cuAPI._character.maxStamina;
                    }
                    cuAPI._evf("OnCharacterStaminaChanged", [cuAPI._character.stamina, cuAPI._character.maxStamina]);
                }
            }

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
        this._openUIs[name] = { window: window.open(name + "/" + name + ".html", "_ui" + name, "", true), visible: true };
    }

    CloseUI(name: string): void {
        var ui : any = this._openUIs[name];
        ui.window.close();
        this._openUIs[name] = null;
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
    OnBuildingModeChanged(c: (buildingMode: boolean) => void): void {}
    ChangeBuildingMode(): void {}

    /* Announcement */

    OnAnnouncement(c: (message: string, type: number) => void): void {}

    /* Character */

    OnCharacterIDChanged(c: (id: string) => void): void {}
    OnCharacterFactionChanged(c: (faction: number) => void): void {}
    OnCharacterRaceChanged(c: (race: number) => void): void {}
    OnCharacterNameChanged(c: (name: string) => void): void {
        var id: string = "OnCharacterNameChanged";
        this._ev(id, c);
        if (this._character.name) {
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

    OnEnemyTargetNameChanged(callback: (name: string) => void): void {}
    OnEnemyTargetHealthChanged(callback: (health: number, maxHealth: number) => void): void {}
    OnEnemyTargetStaminaChanged(callback: (stamina: number, maxStamina: number) => void): void {}
    OnEnemyTargetEffectsChanged(callback: (effects: string) => void): void {}

    /* Friendly Target */

    OnFriendlyTargetNameChanged(callback: (name: string) => void): void {}
    OnFriendlyTargetHealthChanged(callback: (health: number, maxHealth: number) => void): void {}
    OnFriendlyTargetStaminaChanged(callback: (stamina: number, maxStamina: number) => void): void {}
    OnFriendlyTargetEffectsChanged(callback: (effects: string) => void): void {}

    /* Chat */

    OnBeginChat(c: (commandMode: number, text: string) => void): void {}
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
}
