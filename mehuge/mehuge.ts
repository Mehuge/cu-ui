/// <reference path="xmpp.ts" />
module Mehuge {
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
    export function connect(loginToken: string, channel: any, ready: (channel:string) => void) {
        var joined: number = 0, i: number;

        // We support a few ways of specifying the channel.
        if (typeof channel === "string") channel = [channel];
        Xmpp.login(loginToken);
        Xmpp.listen(function (ev:any) {
            switch (ev.type) {
                case "connected":
                    for (var i = 0; i < channel.length; i++) {
                        Xmpp.join(_channelName(channel[i]));
                    }
                    break;
                case "joined":
                    ready(ev);
                    break;
                case "groupchat":
                    var room = ev.from.split("@")[0], o: any;
                    if (room.substr(0, 2) === "$_") {
                        try { o = JSON.parse(ev.body); } catch (e) { }
                    }
                    if (!o) {
                        o = { message: ev.body, id: ev.id };
                    }
                    o.from = room;
                    o.account = ev.from.split("/")[1];
                    for (var i = 0; i < listeners.length; i++) {
                        if (listeners[i]) {
                            listeners[i](o);
                        }
                    }
                    break;
            }
        });
    }
    export function listen(listener: (any) => void) {
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
    export function sendText(message: any, room: string = undefined) {
        if (room) room = _channelName(room);
        Xmpp.sendMessage(message, room);
    }
    export function disconnect() {
        Xmpp.disconnect();
    }
} 