﻿module Xmpp {
    var CHAT_DOMAIN: string = 'chat.camelotunchained.com';
    var CHAT_SERVICE: string = 'conference.' + CHAT_DOMAIN;
    var GLOBAL_CHATROOM_NAME: string = '_global';
    var COMBAT_CHATROOM_NAME: string = '_combat';
    var GLOBAL_CHATROOM: string = GLOBAL_CHATROOM_NAME + '@' + CHAT_SERVICE;
    var COMBAT_CHATROOM: string = COMBAT_CHATROOM_NAME + '@' + CHAT_SERVICE;
    var WEB_API_HOST: string = 'chat.camelotunchained.com';
    var WEB_API_PORT: number = 8222;
    var XMPP_SASL: string = 'urn:ietf:params:xml:ns:xmpp-sasl';
    var XMPP_BIND: string = 'urn:ietf:params:xml:ns:xmpp-bind';
    var id: number = 0;
    var rooms: any = {}, currentRoom: any;
    var listeners = [];
    var streams = 0;

    function nextId() {
        return (++id).toString(16);
    }

    function xmppStream(o: any, hasOpenXmlTag: boolean = false) {
        streams++;
        o = o || {};
        o.xmlns = o.xmlns || 'jabber:client';
        o['xmlns:stream'] = o['xmlns:stream'] || 'http://etherx.jabber.org/streams';
        o.version = o.version || '1.0';
        return {
            toString: () => {
                var xml = [];
                for (var key in o) {
                    if (o.hasOwnProperty(key)) {
                        xml.push(' ', key, "='", o[key], "'");
                    }
                }
                return (hasOpenXmlTag ? "<?xml version='1.0'?>" : '') + '<stream:stream' + xml.join('') + '>';
            }
        };
    }

    function xmppCloseStream() {
        streams--;
        return {
            toString: () => {
                return '</stream:stream>';
            }
        };
    }

    function xmppAuth(o) {
        o = o || {};
        o.mechanism = o.mechanism || "PLAIN";
        o.xmlns = o.xmlns || XMPP_SASL;
        if (!o.value) {
            switch (o.mechanism) {
                case "PLAIN":
                    if (!o.username || !o.password) throw ("xmppAuth missing username/password");
                    break;
                case "CSELOGINTOKEN":
                    if (!o.loginToken) throw ("xmppAuth missing login token");
                    break;
            }
        }
        return {
            toString: () => {
                var data = [], value: string;
                for (var key in o) {
                    if (o.hasOwnProperty(key)) {
                        switch (key) {
                            case 'value':
                                value = o[key];
                                break;
                            case 'loginToken':
                                value = Base64.encode(o[key]);
                                break;
                            case 'username':
                                value = Base64.encode('\0' + o[key] + '\0' + o.password);
                                break;
                            case 'password':  // noop
                                break;
                            default:
                                data.push(' ', key, '=\'', o[key], '\'');
                                break;
                        }
                    }
                }
                return '<auth' + data.join('') + '>' + value + '</auth>';
            }
        };
    }

    var socket, token, connected, authenticated, jid, user, ident;

    export function login(loginToken: string) {
        token = loginToken;
    }

    function send_(msg:any) {
        socket.send(msg.toString());
    }

    function authenticate_(features: HTMLElement, msg) {
        var nodes = features.getElementsByTagName('mechanism'),
            mechanisms = {};

        for (var i = 0, length = nodes.length; i < length; i++) {
            mechanisms[nodes[i].textContent] = true;
        }

        if ("loginToken" in msg && mechanisms["CSELOGINTOKEN"]) {
            msg.mechanism = "CSELOGINTOKEN";
            send_(xmppAuth(msg));
        } else if ("username" in msg && mechanisms["PLAIN"]) {
            msg.mechansim = "PLAIN";
            send_(xmppAuth(msg));
        }
    }

    function bind_(features: HTMLElement) {
        var bind: NodeList = features.getElementsByTagName('bind');
        if (bind && bind.length > 0 && bind[0].attributes['xmlns'].value === XMPP_BIND) {
            send_($iq({ type: 'set', id: nextId() }).c('bind', { xmlns: XMPP_BIND }));
        }
    }

    function failure_(failure: HTMLElement) {
        switch (failure.getAttribute('xmlns')) {
            case XMPP_SASL:
                authenticated = false;
                break;
        }
    }
    function success_(success: HTMLElement) {
        switch (success.getAttribute('xmlns')) {
            case XMPP_SASL:
                authenticated = true;
                send_(xmppStream({ to: CHAT_DOMAIN }));
                break;
        }
    }

    function join_(room: string) {
        room = room.toLowerCase();
        send_($pres({ to: room + "@" + CHAT_SERVICE + '/' + user }).c('x', { xmlns: 'http://jabber.org/protocol/muc' }));
        currentRoom = rooms[room] = {
            room: room + "@" + CHAT_SERVICE,
            presence: null
        };
    }

    function fire(e:any) {
        for (var i = 0; i < listeners.length; i++) {
            if (listeners[i]) {
                listeners[i](e);
            }
        }
    }

    function connect_() {
        socket = new WebSocket('ws://' + WEB_API_HOST + ':' + WEB_API_PORT + '/api/chat', 'xmpp');
        socket.onopen = (e) => {
            send_(xmppStream({ to: CHAT_DOMAIN }, true));
        }
        socket.onmessage = (e) => {
            var domParser = new DOMParser(), doc: Document = domParser.parseFromString(e.data, 'text/xml');
            switch (doc.documentElement.nodeName) {
                case 'stream:features':
                    connected = true;
                    if (!authenticated) {
                        if (typeof token === "string") {
                            authenticate_(doc.documentElement, { loginToken: token });
                        } else {
                            authenticate_(doc.documentElement, token);
                        }
                    } else {
                        bind_(doc.documentElement);
                    }
                    break;
                case 'failure': // auth failure
                    failure_(doc.documentElement);
                    fire({ type: "error", reason: "Authentication failed" });
                    break;              
                case 'success': // auth failure
                    success_(doc.documentElement);
                    break;
                case 'iq':
                    var iq = doc.documentElement;
                    if (iq.getAttribute('type') === 'result') {
                        var bind  = iq.getElementsByTagName('bind')[0].attributes["xmlns"].value;
                        if (bind === XMPP_BIND) {
                            var value: string = iq.getElementsByTagName('jid')[0].textContent;
                            if (value) {
                                jid = value;
                                var a = jid.split(/[@\/]/);
                                user = a[0];
                                ident = a[2];
                                fire({ type: "connected" });
                            }
                        }
                    }
                    break;
                case 'presence':
                    var presence = doc.documentElement,
                        from = presence.attributes["from"].value,
                        x = presence.childNodes[0],
                        o: any = {},
                        status: string;
                    for (var i = 0; i < x.childNodes.length; i++) {
                        var node = x.childNodes[i];
                        switch (node.nodeName) {
                            case "item":
                                o.affiliation = node.attributes["affiliation"].value;
                                o.role = node.attributes["role"].value;
                                break;
                            case "status":
                                status = node.attributes["code"].value;
                                if (status === "110") {
                                    o.present = true;
                                }
                                break;
                        }
                    }
                    if (o.present) {                 // status 110 confirms the users presence in the room.
                        var name = from.split("@")[0], account = from.split("/")[1];
                        var room = rooms[name];
                        if (!room.presence) {
                            room.presence = {};
                        }
                        room.presence[from] = o;            // full presence name
                        fire({ type: "joined", from: from, room: name, account: account });
                    }
                    break;
                case 'message':
                    var message = doc.documentElement,
                        type = message.attributes["type"],
                        id = message.attributes["id"],
                        from = message.attributes["from"],
                        body, iscse = false, nick;
                    for (var i = 0; i < message.childNodes.length; i++) {
                        var node = message.childNodes[i];
                        if (node.nodeName === "body") {
                            body = node.textContent;
                        }
                        if (node.nodeName === "cseflags") {
                            var cse = node.attributes["cse"];
                            iscse = cse && cse.value === "cse";
                        }
                        if (node.nodeName === "nick") {
                            nick = node.nodeValue;
                        }
                    }
                    fire({
                        type: type ? type.value : "",
                        id: id ? id.value : "",
                        from: from ? from.value : "unknown",
                        body: body,
                        iscse: iscse
                    });
                    break;
                default:
                    break;
            }
        }

        socket.onerror = (e) => {
            throw e;
        }

        socket.onclose = (e) => {
            debugger;
        }
    }

    function connect() {
        if (!socket) {
            connect_();
        }
    }

    export function disconnect() {
        while (streams--) send_(xmppCloseStream());
        socket = null;
    }

    export function listen(response: (response: any) => void) {
        listeners.push(response);
        connect();
    }
    export function sendMessage(message: any, room: string = null) {
        if (!room && currentRoom) {
            room = currentRoom.room;
        } else {
            if (!(room in rooms)) return;
            room = rooms[room].room;
        }
        if (room) {
            send_($msg({ to: room, from: jid, type: "groupchat", id: nextId() }).c('body').t(message));
        }
    }

    export function sendIM(message: string, who: string) {
        var from = jid.split(/[@\/]/);
        if (typeof cuAPI !== "undefined" && cuAPI.serverURL.length) {
            from = from[0] + "@shard." + from[1];
        } else {
            from = from[0] + "@" + from[1];
        }
        send_($msg({ to: who, from: from, type: "chat", id: nextId() }).c('body').t(message));
    }

    // Join named room.
    export function join(room: string) {
        join_(room);
    }
} 