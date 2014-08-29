/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/// <reference path="../vendor/jquery.d.ts" />

class Ability {
    id: string;
    icon: string;
    cooldowns: CooldownGroup[] = [];
    duration: number;
    triggerTimeOffset: number;
    name: string;
    tooltip: string;

    buttons: AbilityButton[] = [];
    awaitingUpdate: { (a: Ability): any }[] = null;

    constructor(private cu: CU) {
    }

    MakeButton(): AbilityButton {
        var button = new AbilityButton(this, this.cu);
        this.buttons.push(button);
        return button;
    }

    Perform(): void {
        if (this.cu.gameClientReady) {
            this.cu.gameClient.Attack(this.id);
        }
    }

    UpdateButtons(): void {
        for (var i = 0, len = this.buttons.length; i < len; ++i) {
            var b = this.buttons[i];
            b.UpdateVisuals();
        }
    }

    HandleCooldownChanged(c: CooldownGroup): void {
        if (!this.CurrentlyRunning()) this.UpdateButtons();
    }

    SetAsActive(startTime: number, triggerTime: number): void {
        if (triggerTime < 0.0) triggerTime = startTime + this.triggerTimeOffset;
        if (startTime != this.startWorldTime || triggerTime != this.triggerWorldTime) {
            this.startWorldTime = startTime;
            this.triggerWorldTime = triggerTime;
            this.endWorldTime = triggerTime + this.duration - this.triggerTimeOffset;
            this.UpdateButtons();
        }
    }

    ClearAsActive(): void {
        this.SetAsActive(-1, -1);
    }

    CurrentlyRunning(): boolean {
        return this.startWorldTime > 0.0 &&
               this.triggerWorldTime >= this.startWorldTime &&
               this.triggerWorldTime + (this.duration - this.triggerTimeOffset) > this.cu.ServerTime();
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
                var t = this.cu.ServerTime() - (c.startTime + c.duration);
                if (t > result) result = t;
            }
        }
        return result;
    }

    startWorldTime: number = -1.0;
    triggerWorldTime: number = -1.0;
    endWorldTime: number;
}


class CooldownGroup {
    constructor(public id: number, private cu: CU) {
    }

    abilities: Ability[] = [];

    startTime: number;
    duration: number = 0.0;

    Active() {
        return this.duration > 0.0 && this.startTime + this.duration > this.cu.ServerTime();
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
    constructor(public ability: Ability, private cu: CU) {
        this.rootElement = $('<div/>').addClass('abilityButton');
        this.rootElement.append($('<img/>').addClass('activeHighlight').attr('src', '../images/skillbar/active-frame.gif'));
        this.rootElement.append($('<img/>').addClass('abilityIcon').attr('src', ability.icon).click(() => ability.Perform()));
        this.rootElement.append($('<img/>').addClass('queuedIcon').attr('src', '../images/skillbar/queued-frame.png'));

        this.UpdateVisuals();
    }

    Remove(): void {
        var index = this.ability.buttons.indexOf(this);
        if (index >= 0) {
            this.ability.buttons.splice(index, 1);
        }
        this.rootElement.detach();
    }

    UpdateVisuals(): void {
        if (this.cooldownOverlay) {
            this.cooldownOverlay.detach();
            this.cooldownOverlay = null;
        }

        this.rootElement.attr('queued', this.cu.queuedAbility === this.ability ? 1 : 0);

        if (this.ability.CurrentlyRunning()) {
            if (Math.abs(this.activeStartTime - this.ability.startWorldTime) > 0.1) {
                this.activeStartTime = this.ability.startWorldTime;
                window.setTimeout(() => this.UpdateVisuals(), 1000 * (this.ability.endWorldTime - this.cu.ServerTime()) + 17);
            }
            this.rootElement.attr('running', 1);
            this.rootElement.attr('cooldown', 0);
            return; // bail and don't apply cooldowns if we're running
        } else {
            if (this.activeOverlay) {
                this.activeOverlay.detach();
                this.activeOverlay = null;
            }

            this.rootElement.attr('running', 0);

            this.activeStartTime = -1;
        }

        var currentCooldown = null;
        for (var i = 0, len = this.ability.cooldowns.length; i < len; ++i) {
            var c = this.ability.cooldowns[i];
            if (c.Active()) {
                var frac = (this.cu.ServerTime() - c.startTime) / c.duration;
                var timeLeft = (1.0 - frac) * c.duration;
                if (!(timeLeft > 0.02)) continue;

                if (!currentCooldown) {
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
                    height: Math.round(frac * 100.0) + '%',
                    opacity: 0.6
                }).appendTo(currentCooldown);

                slide.animate({ height: '100%' }, timeLeft * 1000.0, 'linear', () => this.UpdateVisuals());
            }
        }
        this.rootElement.attr('cooldown', (currentCooldown ? 1 : 0));
    }

    rootElement: JQuery;
    private activeStartTime: number = -1;
    private activeOverlay: JQuery = null;
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
    duration: number;
    triggerTime: number;
    name: string;
    tooltip: string;
}


enum XmppMessageType {
    NORMAL = -1,
    ERROR = 0,
    CHAT = 1,
    GROUPCHAT = 2,
    HEADLINE = 3
}


enum XmppRoomStatus {
    UNKNOWN = -1,
    NON_ANONYMOUS_JOIN = 100,
    AFILLIATION_CHANGE = 101,
    SHOW_UNAVAILABLE = 102,
    NO_SHOW_UNAVAILABLE = 103,
    PRIVACY_CHANGE = 104,
    SELF = 110,
    LOGGING_ENABLED = 170,
    LOGGING_DISABLED = 171,
    NON_ANONYMOUS = 172,
    SEMI_ANONYMOUS = 173,
    ANONYMOUS = 174,
    CREATED = 201,
    NICK_CHANGED = 210,
    BANNED = 301,
    NEW_NICK = 303,
    KICKED = 307,
    REMOVED_AFFILIATION = 321,
    REMOVED_NONMEMBER = 322,
    REMOVED_SHUTDOWN = 332,
}


enum XmppAuthMechanism {
    PLAIN,
    CSELOGINTOKEN
}


class JID {
    public user: string = '';
    public domain: string = '';
    public resource: string = '';

    constructor(unparsed: string) {
        // JIDs should be in the format of user@domain/resource (tim@cse.com/Trillian)
        var chopped: Array<string> = unparsed.split(/[@]/);
        if (chopped.length == 0) return;
        if (chopped.length == 1) {
            this.domain = chopped[0];
        } else if (chopped.length > 1) {
            this.user = chopped[0];
            chopped = chopped[1].split(/[\/]/);
            if (chopped.length > 0) this.domain = chopped[0];
            if (chopped.length > 1) this.resource = chopped[1];
        }
    }

    public HasUser(): boolean {
        return this.user && this.user !== '';
    }

    public HasDomain(): boolean {
        return this.domain && this.domain !== '';
    }

    public HasResource(): boolean {
        return this.resource && this.resource !== '';
    }

    public EnsureHasUser(): void {
        if (!this.HasUser()) throw new Error('jid user required');
    }

    public EnsureHasDomain(): void {
        if (!this.HasDomain()) throw new Error('jid domain required');
    }

    public EnsureHasResource(): void {
        if (!this.HasResource()) throw new Error('jid resource required');
    }
}


class CU {
    constructor(initCallback?: () => any,
                connectedCallback?: () => any) {

        this.OnInitialized(initCallback);
        this.OnServerConnected(connectedCallback);

        if (this.HasAPI()) {
            this.gameClient = cuAPI;
            var myCallback = () => {
                this.ready = true;
                this.gameClientReady = true;

                if (_.isFunction(this.gameClient.OnAbilityCooldown)) {
                    this.gameClient.OnAbilityCooldown((c, t, d) => this.HandleAbilityCooldown(c, t, d));
                }

                if (_.isFunction(this.gameClient.OnAbilityActive)) {
                    this.gameClient.OnAbilityActive((curr, start, trigger, queue) =>
                        this.HandleAbilityActive(
                            (curr ? this.abilities[curr] : null),
                            start, trigger,
                            (queue ? this.abilities[queue] : null)));
                }

                if (_.isFunction(this.gameClient.OnAbilityError)) {
                    this.gameClient.OnAbilityError((message) => this.HandleAbilityError(message));
                }

                this.onInit.InvokeCallbacks();

                this.gameServerURL = this.gameClient.serverURL;
                if (this.gameServerURL) {
                    this.onServerConnected.InvokeCallbacks();
                } else {
                    if (_.isFunction(this.gameClient.OnServerConnected)) {
                        this.gameClient.OnServerConnected(() => {
                            this.gameServerURL = this.gameClient.serverURL;
                            this.onServerConnected.InvokeCallbacks();
                        });
                    }
                }
            };

            if (this.gameClient.initialized) {
                myCallback();
            } else {
                this.gameClient.OnInitialized(myCallback);
            }
        } else {
            var self = this;

            $(() => {
                self.ready = true;
                self.onInit.InvokeCallbacks();
            });
        }
    }

    /* Begin Constants */
    public CHAT_DOMAIN = 'chat.camelotunchained.com';
    public CHAT_SERVICE = 'conference.' + this.CHAT_DOMAIN;
    public GLOBAL_CHATROOM = '_global@' + this.CHAT_SERVICE;
    public COMBAT_CHATROOM = '_combat@' + this.CHAT_SERVICE;

    private WEB_API_HOST = 'chat.camelotunchained.com';
    private WEB_API_PORT = 8000;

    private XMPP_SASL = 'urn:ietf:params:xml:ns:xmpp-sasl';
    private XMPP_BIND = 'urn:ietf:params:xml:ns:xmpp-bind';
    /* End Constants */

    /* Begin Variables */
    ready = false;
    gameClient: CUInGameAPI = null;
    gameClientReady = false;
    private onInit = new CallbackSet('onInit');
    private listeners = {};
    private webSocket: WebSocket = null;
    private idCounter: number = 0;
    private isAuthed: boolean = false;
    private isBound: boolean = false;
    private currentJid: JID = null;
    private roomSelfPresences: Array<string> = [];
    /* End Variables */

    OnInitialized(c: () => any) {
        if (this.ready) {
            c();
        } else {
            this.onInit.AddCallback(c, true);
        }
    }

    HasAPI(): boolean {
        return typeof cuAPI !== 'undefined';
    }

    ApiUrl(action): string {
        // TODO: this also needs to handle checking whether we're connected or not
        if (this.HasAPI()) return 'cuapi://server/api/' + action;
        return 'http://localhost:8000/api/' + action;
    }

    InGame(): boolean {
        return this.gameClient !== null;
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
            this.cooldowns[cooldownID] = c = new CooldownGroup(cooldownID, this);
        }
        c.Set(timeStarted, duration);
    }

    RequestAbility(id: string, callback: (a: Ability) => any, force: boolean): void {
        var current = this.abilities[id];

        if (current && !current.awaitingUpdate && !force) {
            callback(current);
        } else {
            if (!current) {
                current = new Ability(this);
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
            if (typeof cuAPI.abilityNumbers === 'undefined') { return; }
            this.allAbilitiesCallback = [callback];
            $.getJSON(this.gameServerURL + 'abilities', (data) => {
                var abilities = data.filter(ability => {
                    return cuAPI.abilityNumbers.indexOf(ability.id) !== -1;
                });
                this.UpdateAllAbilities(abilities);
            });
        } else {
            this.allAbilitiesCallback.push(callback);
        }
    }

    private UpdateAbility(rawAbility: ServerAbility): Ability {
        var a = new Ability(this);
        a.id = rawAbility.id;
        a.icon = rawAbility.icon;
        if (rawAbility.cooldowns) {
            for (var i = 0; i < rawAbility.cooldowns.length; ++i) {
                var cooldownID = rawAbility.cooldowns[i];
                var c = this.cooldowns[cooldownID];
                if (!c) {
                    this.cooldowns[cooldownID] = c = new CooldownGroup(cooldownID, this);
                }
                if (a.cooldowns.indexOf(c) === -1) {
                    c.abilities.push(a);
                    a.cooldowns.push(c);
                }
            }
        }
        a.duration = rawAbility.duration;
        a.triggerTimeOffset = rawAbility.triggerTime;
        a.name = rawAbility.name;
        a.tooltip = rawAbility.tooltip;

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
            a.SetAsActive(old.startWorldTime, old.triggerWorldTime);
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

    public HandleAbilityActive(current: Ability, startTime: number, triggerTime: number, queued: Ability) {
        var updatedCurrent = false;
        var oldCurrent = this.currentAbility;
        var oldQueued = this.queuedAbility;
        console.log('HandleAbilityActive newCurr=' + (current ? current.id : 'null') + ' oldCurr=' + (oldCurrent ? oldCurrent.id : 'null') + ' newQ=' + (queued ? queued.id : 'null') + ' oldQ=' + (oldQueued ? oldQueued.id : 'null'));
        this.currentAbility = current;
        this.queuedAbility = queued;
        if (current !== oldCurrent ||
            (current && (startTime != current.startWorldTime ||
                         triggerTime >= 0.0 && triggerTime != current.triggerWorldTime))) {
            updatedCurrent = true;
            if (current) current.SetAsActive(startTime, triggerTime);
            if (oldCurrent && oldCurrent !== current) oldCurrent.ClearAsActive();
        }
        if (queued != oldQueued) {
            if (queued && !(updatedCurrent && (queued === current || queued === oldCurrent))) {
                queued.UpdateButtons();
            }
            if (oldQueued && !(updatedCurrent && (oldQueued === current || oldQueued === oldCurrent))) {
                oldQueued.UpdateButtons();
            }
        }
    }
    
    currentAbility: Ability = null;
    queuedAbility: Ability = null;

    public RunAtInterval(callback: () => void, updateFPS: number = 5): number {
        if (updateFPS > 0) {
            return window.setInterval(callback, 1000 / updateFPS);
        }
    }

    public FindElement(selector: string, context?: Element): JQuery {
        var $element: JQuery = $(selector, context);
        if (!$element.length) throw new Error(selector + ' required');
        return $element;
    }

    public HandleAbilityError(message) {
        this.Fire('HandleAbilityError', message);
    }

    public Fire(event: string, ...args: any[]) {
        if (this.listeners.hasOwnProperty(event)) {
            this.listeners[event].forEach(function(listener) {
                listener.apply(this, args);
            });
        }
    }

    public Listen(event: string, callback: Function) {
        if (!this.listeners.hasOwnProperty(event)) {
            this.listeners[event] = [];
        }

        this.listeners[event].push(callback);
    }

    public GetFactionCssClassName(factionValue: Number): string {
        switch (factionValue) {
            case 2: return 'arthurian';
            case 1: return 'viking';
            default: return 'tdd';
        }
    }

    public GetFactionName(factionValue: Number): string {
        switch (factionValue) {
            case 2: return 'Arthurian';
            case 1: return 'Viking';
            default: return 'Tuatha De Danann';
        }
    }

    public GetPlayerName(player: any): string {
        var name = player.name;
        if (!name) this.GetFactionName(player.faction);
        return _.escape(name);
    }

    public JoinMUC(room): void {
        if (cu.HasAPI()) {
            cuAPI.JoinMUC(room);
        } else {
            throw new Error('Not implemented');
        }
    }

    public LeaveMUC(room): void {
        if (cu.HasAPI()) {
            cuAPI.LeaveMUC(room);
        } else {
            throw new Error('Not implemented');
        }
    }

    public SendChat(messageType, room, input): void {
        if (cu.HasAPI()) {
            cuAPI.SendChat(messageType, room, input);
        } else {
            this.SendWebSocketChatMessage(messageType, room, input);
        }
    }

    public ConsoleCommand(body): void {
        if (cu.HasAPI()) cuAPI.ConsoleCommand(body);
    }

    public RequestInputOwnership(): void {
        if (cu.HasAPI()) cuAPI.RequestInputOwnership();
    }

    public ReleaseInputOwnership(): void {
        if (cu.HasAPI()) cuAPI.ReleaseInputOwnership();
    }

    public DestroyWebSocket() {
        if (this.webSocket) {
            this.webSocket.close();

            this.webSocket = null;
        }
    }

    public CreateWebSocket(loginToken: string, domain: string, boundCallback: () => void, presenceCallback: () => void) {
        var self: CU = this;

        if (!loginToken) {
            return null;
        }

        this.webSocket = new WebSocket('ws://' + this.WEB_API_HOST + ':' + this.WEB_API_PORT + '/api/chat', 'xmpp');

        this.webSocket.onopen = e => {
            console.log('onopen', e);

            // open stream
            self.SendWebSocketMessage(self.$openStream({ hasOpenXmlTag: true, to: domain }));
        };

        this.webSocket.onmessage = e => {
            var xmlDoc = self.ParseXml(e.data);

            switch (xmlDoc.documentElement.nodeName) {
                case 'stream:stream':
                    console.log('stream:stream response', xmlDoc.documentElement);
                    break;
                case 'stream:features':
                    console.log('stream:features response', xmlDoc.documentElement);

                    // close stream when navigating away from page
                    $(window).unload(() => {
                        if (self.HasOpenWebSocket()) {
                            self.SendWebSocketMessage(self.$closeStream());
                        }
                    });

                    var features = xmlDoc.documentElement;

                    if (!self.isAuthed) {
                        var mechanisms = features.getElementsByTagName('mechanism');

                        var hasCseLoginTokenMechanism = false;

                        for (var i = 0, length = mechanisms.length; i < length; i++) {
                            var mechanism = self.GetElementNodeValue(mechanisms[i]);
                            if (mechanism === XmppAuthMechanism[1 /* CSELOGINTOKEN */]) {
                                hasCseLoginTokenMechanism = true;

                                break;
                            }
                        }

                        if (hasCseLoginTokenMechanism) {
                            self.SendWebSocketMessage(self.$auth({ loginToken: loginToken, mechanism: XmppAuthMechanism[1 /* CSELOGINTOKEN */] }));
                        }
                    } else {
                        var bind = self.GetFirstElement(features.getElementsByTagName('bind'));

                        if (bind && bind.getAttribute('xmlns') === self.XMPP_BIND) {
                            self.SendWebSocketMessage($iq({ type: 'set', id: self.GetNextId() }).c('bind', { xmlns: self.XMPP_BIND }));
                        }
                    }

                    break;
                case 'failure':
                    console.log('failure response', xmlDoc.documentElement);

                    var failure = xmlDoc.documentElement;

                    if (failure.getAttribute('xmlns') === this.XMPP_SASL) {
                        self.isAuthed = false;

                        self.Fire('XmppAuthFailed');
                    }

                    break;
                case 'success':
                    console.log('success response', xmlDoc.documentElement);

                    var success = xmlDoc.documentElement;

                    if (success.getAttribute('xmlns') === self.XMPP_SASL) {
                        self.isAuthed = true;
                    }

                    if (self.isAuthed) {
                        self.SendWebSocketMessage(self.$openStream({ to: domain }));
                    }

                    break;
                case 'iq':
                    console.log('iq response', xmlDoc.documentElement);

                    var iq = xmlDoc.documentElement;

                    if (iq.getAttribute('type') === 'result') {
                        var bind = self.GetFirstElement(iq.getElementsByTagName('bind'));

                        if (bind && bind.getAttribute('xmlns') === self.XMPP_BIND) {
                            var jidValue = self.GetFirstElementValue(iq.getElementsByTagName('jid'));

                            if (jidValue) {
                                var jid: JID = new JID(jidValue);

                                if (jid.HasUser()) {
                                    self.currentJid = jid;

                                    self.isBound = true;

                                    boundCallback();
                                }
                            }
                        }
                    }

                    break;
                case 'presence':
                    console.log('presence response', xmlDoc.documentElement);

                    if (!self.isAuthed || !self.isBound) return;

                    // check if it has finished receiving the room roster

                    var presence = xmlDoc.documentElement;

                    var from = presence.getAttribute('from');

                    if (!from || !from.length) {
                        return;
                    }

                    var x = self.GetFirstElement(presence.getElementsByTagName('x'));

                    if (!x || x.getAttribute('xmlns') !== 'http://jabber.org/protocol/muc#user') {
                        return;
                    }

                    var statuses = x.getElementsByTagName('status');

                    if (!statuses || !statuses.length) {
                        return;
                    }

                    var hasSelfPresence = false;

                    for (var i = 0, length = statuses.length; i < length; i++) {
                        var status = statuses[i];

                        var code = status.getAttribute('code');

                        if (parseInt(code, 10) === XmppRoomStatus.SELF) {
                            var jid: JID = new JID(from);

                            jid.EnsureHasUser();

                            jid.EnsureHasDomain();

                            self.roomSelfPresences.push(jid.user + '@' + jid.domain);

                            hasSelfPresence = true;

                            break;
                        }
                    }

                    if (hasSelfPresence) {
                        presenceCallback();

                        self.Fire('XmppPresenceCompleted');
                    }

                    break;
                case 'message':
                    console.log('message response', xmlDoc.documentElement);

                    if (!self.isAuthed || !self.isBound) return;

                    var message = xmlDoc.documentElement;

                    var messageType = XmppMessageType[message.getAttribute('type').toUpperCase()];

                    var from = message.getAttribute('from');

                    var body = self.GetFirstElementValue(message.getElementsByTagName('body'));

                    var nick = self.GetFirstElementValue(message.getElementsByTagName('nick'));

                    var cseflags = self.GetFirstElement(message.getElementsByTagName('cseflags'));

                    var isCse = cseflags && cseflags.getAttribute('cse') === 'cse';

                    self.Fire('OnChat', messageType, from, body, nick, isCse);

                    break;
                default:
                    console.log('unhandled response', xmlDoc.documentElement.nodeName, xmlDoc.documentElement);
                    break;
            }
        };

        this.webSocket.onerror = e => {
            console.log('onerror', e);
        };

        this.webSocket.onclose = e => {
            console.log('onclose', e);

            self.webSocket = null;
            self.idCounter = 0;
            self.isAuthed = false;
            self.isBound = false;
            self.currentJid = null;
            self.roomSelfPresences = [];

            self.Fire('XmppDisconnected');
        };

        return this.webSocket;
    }

    private SendWebSocketChatMessage(messageType, room, input) {
        if (this.HasChatCurrentUser()) {
            if (this.HasRoomPresence(room)) {
                this.SendWebSocketMessageFromCurrentUser(messageType, room, input);
            } else {
                this.JoinRoomAsCurrentUser(room);
            }
        }
    }

    private HasWebSocket(): boolean {
        return this.webSocket !== null;
    }

    private HasOpenWebSocket(): boolean {
        return this.HasWebSocket() && this.webSocket.readyState == this.webSocket.OPEN;
    }

    private HasChatCurrentUser(): boolean {
        return this.HasOpenWebSocket() && this.isAuthed && this.isBound && this.currentJid && this.currentJid.HasUser();
    }

    private SendWebSocketMessage(msg: any): void {
        if (this.HasOpenWebSocket()) this.webSocket.send(msg.toString());
    }

    private HasRoomPresence(room): boolean {
        return this.roomSelfPresences.indexOf(room) !== -1;
    }

    private GetNextId(): string {
        return (++this.idCounter).toString(16);
    }

    private SendWebSocketMessageFromCurrentUser(messageType, room, input): void {
        this.SendWebSocketMessage($msg({ to: room, from: room + '/' + this.currentJid.user, type: XmppMessageType[messageType].toLowerCase(), id: this.GetNextId() }).c('body').t(input));
    }

    public JoinRoomAsCurrentUser(room: string) {
        this.SendWebSocketMessage($pres({ to: room + '/' + this.currentJid.user }).c('x', { xmlns: 'http://jabber.org/protocol/muc' }));
    }

    private GetFirstElement(elements) {
        if (elements && elements.length !== 0) {
            return elements[0];
        }
    }

    private GetFirstElementValue(elements) {
        var first = this.GetFirstElement(elements);
        if (first) {
            return this.GetElementNodeValue(first);
        }
    }

    private GetElementNodeValue(element) {
        if (element.childNodes && element.childNodes.length !== 0) {
            return element.childNodes[0].nodeValue;
        }
    }

    private ParseXml(xml) {
        if (typeof DOMParser !== 'undefined') {
            var domParser = new DOMParser();
            return domParser.parseFromString(xml, 'text/xml');
        } else if (typeof ActiveXObject !== 'undefined' && new ActiveXObject('Microsoft.XMLDOM')) {
            var xmlDoc = new ActiveXObject('Microsoft.XMLDOM');
            xmlDoc.async = 'false';
            xmlDoc.loadXML(xml);
            return xmlDoc;
        } else {
            throw new Error('No XML parser found');
        }
    }

    private $openStream(attrs) {
        if (!_.isObject(attrs)) {
            attrs = {};
        }

        if (!_.isString(attrs.xmlns)) {
            attrs.xmlns = 'jabber:client';
        }

        if (!_.isString(attrs['xmlns:stream'])) {
            attrs['xmlns:stream'] = 'http://etherx.jabber.org/streams';
        }

        if (!_.isString(attrs.version)) {
            attrs.version = '1.0';
        }

        return {
            toString: () => {
                var data = [];

                for (var key in attrs) {
                    if (attrs.hasOwnProperty(key)) {
                        data.push(' ', key, '=\'', attrs[key], '\'');
                    }
                }

                return (attrs.hasOpenXmlTag ? '<?xml version=\'1.0\'?>' : '') + '<stream:stream' + data.join('') + '>';
            }
        };
    }

    private $closeStream() {
        return {
            toString: () => '</stream:stream>'
        };
    }

    private $auth(attrs) {
        if (!_.isObject(attrs))
            attrs = {};

        if (!_.isString(attrs.mechanism)) {
            attrs.mechanism = XmppAuthMechanism[XmppAuthMechanism.PLAIN];
        } else if (_.isNumber(attrs.mechanism)) {
            attrs.mechanism = XmppAuthMechanism[attrs.mechanism];
        }

        if (!_.isString(attrs.value)) {
            switch (XmppAuthMechanism[attrs.mechanism]) {
                case XmppAuthMechanism[XmppAuthMechanism.PLAIN]:
                    if (!_.isString(attrs.username) || !_.isString(attrs.password)) {
                        throw new Error('$auth with PLAIN mechanism requires username and password');
                    }
                    break;
                case XmppAuthMechanism[XmppAuthMechanism.CSELOGINTOKEN]:
                    if (!_.isString(attrs.loginToken)) {
                        throw new Error('$auth with CSELOGINTOKEN mechanism requires login token');
                    }
                    break;
            }
        }

        if (!_.isString(attrs.xmlns)) {
            attrs.xmlns = 'urn:ietf:params:xml:ns:xmpp-sasl';
        }

        return {
            toString: () => {
                var data = [];

                for (var key in attrs) {
                    if (attrs.hasOwnProperty(key) && key != 'value' && key != 'loginToken' && key != 'username' && key != 'password') {
                        data.push(' ', key, '=\'', attrs[key], '\'');
                    }
                }

                var value: string;

                if (attrs.value) {
                    value = attrs.value;
                } else {
                    switch (attrs.mechanism) {
                    case XmppAuthMechanism[XmppAuthMechanism.PLAIN]:
                        value = Base64.encode('\0' + attrs.username + '\0' + attrs.password);
                        break;
                    case XmppAuthMechanism[XmppAuthMechanism.CSELOGINTOKEN]:
                        value = Base64.encode(attrs.loginToken);
                        break;
                    }
                }

                return '<auth' + data.join('') + '>' + value + '</auth>';
            }
        };
    }
}

module Tooltip {
    var $element: JQuery;

    var showTimeout: number;

    var hideTimeout: number;

    var myOptions: any;

    export function init(elements: any, options?: any) {
        $element = $('#tooltip');

        if (!$element.length) {
            $element = $('<div>').attr('id', 'tooltip').appendTo(document.body);
        }

        if (_.isString(elements)) {
            $(elements).hover(show, hide);
        } else if (_.isObject(elements)) {
            elements.hover(show, hide);
        }

        myOptions = options || {};
    }

    function show() {
        var $this = $(this);

        var title = $this.attr('data-tooltip-title');

        var hasTitle = !_.isEmpty(title);

        var content = $this.attr('data-tooltip-content');

        var hasContent = !_.isEmpty(content);

        if (!hasTitle && !hasContent) return;

        clearTimeout(hideTimeout);

        $element.empty();

        if (hasTitle) {
            $('<h1>').addClass('tooltip-title').text(title).appendTo($element);
        }

        if (hasContent) {
            $('<div>').addClass('tooltip-content').text(content).appendTo($element);
        }

        var offset = $this.offset();

        var left = offset.left + (myOptions.leftOffset || 0);

        var top = offset.top - $element.height() + (myOptions.topOffset || 0);

        $element.css({ left: left, top: top });

        showTimeout = setTimeout(() => $element.stop().fadeIn(200), 800);
    }

    function hide() {
        clearTimeout(showTimeout);

        hideTimeout = setTimeout(() => $element.stop().fadeOut(100), 400);
    }
}

var cu: CU = new CU();

interface CUInGameAPI {
    // These are the only things that are guaranteed to exist from the time
    // the page is created. Everything else will be constructed over the course
    // of the client's setup, concurrent to the page load and inital script
    // execution. Anything you need to do in setup should be attached to
    // cu.OnInitialized(), which will be called after the page is loaded
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

    OnAbilityActive(c: (currentAbility: string, timeStarted: number, timeTriggered: number, queuedAbility: string) => any): number;
    CancelOnAbilityActive(c: number);

    OnAbilityError(c: (message: string) => any): void;

    inventoryItemIDs: string[];

    Equip(itemID: string): void;
    OnEquipped(callback: (itemID: string) => any);

    Unequip(itemID: string): void;
    OnUnequipped(callback: (itemID: string) => any);

    GetItem(itemID: string): void;
    OnGetItemResponse(callback: (itemID: string, data: string) => any);
}

declare var cuAPI: any;
