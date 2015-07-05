/// <reference path="../vendor/jquery.d.ts" />

class Ability {
    id: string;
    icon: string;
    cooldowns: CooldownGroup[] = [];
    buttons: AbilityButton[] = [];

    awaitingUpdate: { (a: Ability): any }[] = null;

    MakeButton(): AbilityButton {
        var button = new AbilityButton(this);
        this.buttons.push(button);
        return button;
    }

    Perform(): void {
        if (daoc.gameClientReady) {
            daoc.gameClient.Attack(this.id);
        }
    }

    HandleCooldownChanged(c: CooldownGroup): void {
        for (var i = 0, len = this.buttons.length; i < len; ++i) {
            var b = this.buttons[i];
            b.HandleCooldownChanged();
        }
    }

    CurrentlyRunning(): boolean {
        return false;
    }

    OnCooldown(): boolean {
        for (var i = 0, len = this.cooldowns.length; i < len; ++i) {
            var c = this.cooldowns[i];
            if (c.Active()) return true;
        }
        return false;
    }

    CooldownTimeLeft(): number {
        var result = 0.0;
        for (var i = 0, len = this.cooldowns.length; i < len; ++i) {
            var c = this.cooldowns[i];
            if (c.duration > 0.0) {
                var t = daoc.ServerTime() - (c.startTime + c.duration);
                if (t > result) result = t;
            }
        }
        return result;
    }
}


class CooldownGroup {
    constructor(public id: number) {
    }

    abilities: Ability[] = [];

    startTime: number;
    duration: number = 0.0;

    Active() {
        return this.duration > 0.0 && this.startTime + this.duration > daoc.ServerTime();
    }

    Set(newStart: number, newDuration: number) {
        if (newStart === this.startTime && newDuration === this.duration) return;

        var wasActive = this.Active();
        this.startTime = newStart;
        this.duration = newDuration;
        if (wasActive || this.Active()) {
            for (var i = 0, len = this.abilities.length; i < len; ++i) {
                var a = this.abilities[i];
                a.HandleCooldownChanged(this);
            }
        }
    }
}


class AbilityButton {
    constructor(public ability: Ability) {
        this.rootElement = $('<div/>', {
            class: 'abilityButton'
        });
        this.rootElement.append($('<img/>', {
            class: 'abilityIcon',
            src: ability.icon
        }).click((event) => {
            ability.Perform();
        }));
    }

    Remove(): void {
        var index = this.ability.buttons.indexOf(this);
        if (index >= 0) {
            this.ability.buttons.splice(index, 1);
        }
        this.rootElement.detach();
    }

    HandleCooldownChanged(): void {
        if (this.cooldownOverlay) {
            this.cooldownOverlay.detach();
            this.cooldownOverlay = null;
        }

        var currentCooldown = null;
        for (var i = 0, len = this.ability.cooldowns.length; i < len; ++i) {
            var c = this.ability.cooldowns[i];
            if (c.Active()) {
                var frac = (daoc.ServerTime() - c.startTime) / c.duration;
                var timeLeft = (1.0 - frac) * c.duration;
                if (!(timeLeft > 0.01)) continue;

                if (!this.cooldownOverlay) {
                    currentCooldown = this.cooldownOverlay = $('<div/>', {
                        class: 'cooldownRoot'
                    }).append($('<div/>', {
                        class: 'cooldownSlide',
                        opacity: 0.3
                    }));
                    this.rootElement.append(currentCooldown);
                }

                var slide = $('<div/>', {
                    class: 'cooldownSlide',
                    width: Math.round((1 - frac) * 100.0) + '%',
                    opacity: 0.6
                }).appendTo(currentCooldown);

                slide.animate({ width: '0%' }, timeLeft * 1000.0, 'linear', () => {
                    slide.detach();
                    if (currentCooldown.children().length == 1) {
                        currentCooldown.detach();
                        if (this.cooldownOverlay == currentCooldown) {
                            this.cooldownOverlay = null;
                        }
                    }
                });
            }
        }
    }

    rootElement: JQuery;
    private cooldownOverlay: JQuery = null;
}


class CallbackSet {
    private nextKey = 0;
    constructor(private prefix: string) {
    }

    AddCallback(callback: () => any, oneTimeOnly: boolean): string {
        var key = this.prefix + ++this.nextKey;
        if (callback) {
            this[key] = { func: callback, once: oneTimeOnly };
        }
        return key;
    }

    CancelCallback(key: string) {
        if (this.hasOwnProperty(key) && key != 'prefix' && key != 'nextKey') {
            delete this[key];
        }
    }

    InvokeCallbacks(): void {
        for (var key in this) {
            if (this.hasOwnProperty(key) && key != 'prefix' && key != 'nextKey') {
                var c = this[key];
                c.func();
                if (c.once) {
                    delete this[key];
                }
            }
        }
    }
}


interface ServerAbility {
    id: string;
    icon: string;
    cooldowns?: number[];
}

class DAOC {
    constructor(public uiRootPath: string,
                initCallback?: () => any,
                connectedCallback?: () => any) {

        this.OnInitialized(initCallback);
        this.OnServerConnected(connectedCallback);

        if (typeof cuAPI !== 'undefined') {
            this.gameClient = cuAPI;
            var myCallback = () => {
                this.ready = true;
                this.gameClientReady = true;

                this.gameClient.OnAbilityCooldown((c, t, d) => this.HandleAbilityCooldown(c, t, d));

                this.onInit.InvokeCallbacks();

                this.gameServerURL = this.gameClient.serverURL;
                if (this.gameServerURL) {
                    this.onServerConnected.InvokeCallbacks();
                } else {
                    this.gameClient.OnServerConnected(() => {
                        this.gameServerURL = this.gameClient.serverURL;
                        this.onServerConnected.InvokeCallbacks();
                    });
                }
            };

            if (this.gameClient.initialized) {
                myCallback();
            } else {
                this.gameClient.OnInitialized(myCallback);
            }
        } else {
            $(() => {
                this.ready = true;
                this.onInit.InvokeCallbacks();
            });
        }
    }

    ready = false;
    gameClient: DAOCInGameAPI = null;
    gameClientReady = false;
    private onInit = new CallbackSet('onInit');

    OnInitialized(c: () => any) {
        if (this.ready) {
            c();
        } else {
            this.onInit.AddCallback(c, true);
        }
    }

    InGame(): boolean {
        return this.gameClient !== null;
    }

    FixUIPath(path: string): string {
        if (path.length > 2) {
            if (path[0] == '/') return this.uiRootPath + path;
            if (path[0] == '.' && path[1] == '/') return this.uiRootPath + path.slice(1);
        }
        return path;
    }

    timeStarted = Date.now();
    private gameServerURL: string = null;
    private onServerConnected = new CallbackSet('onServerConnected');

    OnServerConnected(c: () => any) {
        if (this.gameServerURL) {
            c();
        } else {
            this.onServerConnected.AddCallback(c, true);
        }
    }

    SetDebugServer(serverURL?: string) {
        if (!this.gameClient) {
            if (!serverURL) serverURL = 'http://localhost:8000/api/';
            this.gameServerURL = serverURL;
            this.OnInitialized(() => this.onServerConnected.InvokeCallbacks());
        }
    }

    ServerTime(): number {
        if (this.gameClientReady) {
            return this.gameClient.serverTime;
        } else if (this.gameClient) {
            return 0.0;
        } else {
            return (Date.now() - this.timeStarted) / 1000.0;
        }
    }


    abilities: { [id: string]: Ability } = {};
    cooldowns: { [id: number]: CooldownGroup } = {};
    private allAbilitiesCallback: { (a: Ability[]): any }[];

    HandleAbilityCooldown(cooldownID: number, timeStarted: number, duration: number) {
        var c = this.cooldowns[cooldownID];
        if (!c) {
            this.cooldowns[cooldownID] = c = new CooldownGroup(cooldownID);
        }
        c.Set(timeStarted, duration);
    }

    RequestAbility(id: string, callback: (a: Ability) => any, force: boolean): void {
        var current = this.abilities[id];

        if (current && !current.awaitingUpdate && !force) {
            callback(current);
        } else {
            if (!current) {
                current = new Ability();
                current.id = id;
            }
            if (!current.awaitingUpdate) {
                current.awaitingUpdate = [callback];
            } else {
                current.awaitingUpdate.push(callback);
            }
            $.getJSON(this.gameServerURL + 'abilities/' + id, (data) => this.UpdateAbility(data));
        }
    }

    RequestAllAbilities(callback: (a: Ability[]) => any): void {
        if (!this.allAbilitiesCallback) {
            this.allAbilitiesCallback = [callback];
            $.getJSON(this.gameServerURL + 'abilities', (data) => this.UpdateAllAbilities(data));
        } else {
            this.allAbilitiesCallback.push(callback);
        }
    }

    private UpdateAbility(rawAbility: ServerAbility): Ability {
        var a = new Ability();
        a.id = rawAbility.id;
        a.icon = this.FixUIPath(rawAbility.icon);
        if (rawAbility.cooldowns) {
            for (var i = 0; i < rawAbility.cooldowns.length; ++i) {
                var cooldownID = rawAbility.cooldowns[i];
                var c = this.cooldowns[cooldownID];
                if (!c) {
                    this.cooldowns[cooldownID] = c = new CooldownGroup(cooldownID);
                }
                if (a.cooldowns.indexOf(c) === -1) {
                    c.abilities.push(a);
                    a.cooldowns.push(c);
                }
            }
        }
        var old = this.abilities[a.id];
        this.abilities[a.id] = a;
        if (old) {
            for (var i = 0; i < old.cooldowns.length; ++i) {
                var index = old.cooldowns[i].abilities.indexOf(old);
                if (index >= 0) {
                    old.cooldowns[i].abilities.splice(index, 1);
                }
            }
            a.buttons = old.buttons;
            for (var i = 0; i < a.buttons.length; ++i) {
                a.buttons[i].ability = a;
            }
            if (old.awaitingUpdate) {
                for (var i = 0; i < old.awaitingUpdate.length; ++i) {
                    old.awaitingUpdate[i](a);
                }
            }
        }
        return a;
    }

    private UpdateAllAbilities(rawList: ServerAbility[]) {
        var convertedList = <Ability[]><any>rawList;
        var oldAbilities = <{ [id: string]: Ability }>$.extend({}, this.abilities);
        for (var i = 0, len = rawList.length; i < len; ++i) {
            var a = convertedList[i] = this.UpdateAbility(rawList[i]);
            delete oldAbilities[a.id];
        }
        for (var id in oldAbilities) {
            delete this.abilities[id];
        }
        if (this.allAbilitiesCallback) {
            for (i = 0, len = this.allAbilitiesCallback.length; i < len; ++i) {
                this.allAbilitiesCallback[i](convertedList);
            }
            this.allAbilitiesCallback = null;
        }
    }

}

declare var daoc: DAOC;

interface DAOCInGameAPI {
    // These are the only things that are guaranteed to exist from the time
    // the page is created. Everything else will be constructed over the course
    // of the client's setup, concurrent to the page load and inital script
    // execution. Anything you need to do in setup should be attached to
    // daoc.OnInitialized(), which will be called after the page is loaded
    // and this is fully set up.
    initialized: boolean;
    OnInitialized(c: () => any): number;
    CancelOnInitialized(c: number);

    // Everything else only exists after this.initialized is set and the
    // OnInitialized callbacks are invoked.

    OnServerConnected(c: () => any): number;
    CancelOnServerConnected(c: number);
    serverTime: number;
    serverURL: string;

    Attack(abilityID: string): void;

    OnAbilityCooldown(c: (cooldownID: number, timeStarted: number, duration: number) => any): number;
    CancelOnAbilityCooldown(c: number);
}

declare var cuAPI: any;

