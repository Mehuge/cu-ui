/// <reference path="xmpp.ts" />
module MehugeChat {
    var listeners = [];

    // return the cooked channel name (base64 encoded channles are $_ prefixed)
    function _channelName(name: string) {
        // possible base64 encoded channel name without a $_ prefix, add the $_ prefix 
        // (for backward compatibility)
        // can remove this eventually
        if (name.substr(-1) === "=" && name.substr(0, 2) !== "$_") {
            return "$_" + name;
        }
        return name;
    }

    // Connect to chat channels.
    export function connect(loginToken: string, channel: any, onjoin: (channel:string) => void = null) {
        var joined: number = 0, i: number;

        // We support a few ways of specifying the channel.
        if (typeof channel === "string") channel = [channel];
        Xmpp.login(loginToken);
        Xmpp.listen(function (ev: any) {
            var msg: any;
            switch (ev.type) {
                case "connected":
                    msg = ev;
                    for (var i = 0; i < channel.length; i++) {
                        Xmpp.join(_channelName(channel[i]));
                    }
                    break;
                case "joined":
                    if (onjoin) onjoin(ev);
                    msg = ev;
                    break;
                case "groupchat":
                    var room = ev.from.split("@")[0], o: any;
                    if (room.substr(0, 2) === "$_") {
                        try { msg = JSON.parse(ev.body); } catch (e) { }
                    }
                    if (!msg) {
                        msg = { message: ev.body, id: ev.id };
                    }
                    msg.from = room;
                    msg.account = ev.from.split("/")[1];
                    msg.type = ev.type;
                    break;
                case "chat":
                    msg = {
                        from: "IM",
                        account: ev.from.split("@")[0],
                        type: ev.type,
                        message: ev.body,
                        id: ev.id
                    };
                    break;
                case "error":
                    msg = { room: "ERROR", body: ev.reason };
                    break;                    
            }
            if (msg) {
                for (var i = 0; i < listeners.length; i++) {
                    if (listeners[i]) {
                        var listener = listeners[i];
                        if (Array.isArray(listener)) {
                            for (var l = 0; l < listener.length - 1; l++) {
                                if (listener[l] === msg.type) {
                                    listener[listener.length - 1](msg);
                                }
                            }
                        } else {
                            listeners[i](msg);
                        }
                    }
                }
            }
        });
    }
    export function listen(listener: any) {
        listeners.push(listener);
    };
    export function join(room: string = undefined) {
        if (room) room = _channelName(room);
        Xmpp.join(room);
    }
    export function send(o: any, room: string = undefined) {
        if (room) room = _channelName(room);
        Xmpp.sendMessage(JSON.stringify(o), room);
    }
    export function sendIM(text: string, who: string) {
        Xmpp.sendIM(text, who);
    }
    export function sendText(message: any, room: string = undefined) {
        if (room) room = _channelName(room);
        Xmpp.sendMessage(message, room);
    }
    export function disconnect() {
        Xmpp.disconnect();
    }
} 