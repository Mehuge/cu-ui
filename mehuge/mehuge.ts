/// <reference path="xmpp.ts" />
module Mehuge {
    var listeners = [];
    export function connect(loginToken: string, channel: any, ready: () => void) {
        var joined: number = 0;
        Xmpp.login(loginToken);
        Xmpp.listen(function (e) {
            switch (e.type) {
                case "connected":
                    if (typeof channel === "string") channel = [channel];
                    for (var i = 0; i < channel.length; i++) {
                        Xmpp.join("$_" + channel[i]);
                    }
                    break;
                case "joined":
                    if (++joined === channel.length) {
                        ready();
                    }
                    break;
                case "groupchat":
                    try {
                        var o = JSON.parse(e.body);
                    } catch (e) {
                        o = { message: e.body };
                        break;
                    }
                    o.account = e.from.split("/")[1];
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
    export function send(o: any, room: string = undefined) {
        if (room) room = "$_" + room;
        Xmpp.sendMessage(JSON.stringify(o), room);
    }
    export function disconnect() {
        Xmpp.disconnect();
    }
} 