/// <reference path="xmpp.ts" />
module Mehuge {
    var listeners = [];
    export function connect(loginToken: string, channel: string, ready: () => void) {
        Xmpp.login(loginToken);
        Xmpp.listen(function (e) {
            switch (e.type) {
                case "connected":
                    Xmpp.join("$_" + channel);
                    break;
                case "joined":
                    ready();
                    break;
                case "groupchat":
                    try {
                        var o = JSON.parse(e.body);
                    } catch (e) {
                        break;
                    }
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
    export function send(o:any) {
        Xmpp.sendMessage(JSON.stringify(o));
    }
    export function disconnect() {
        Xmpp.disconnect();
    }
} 