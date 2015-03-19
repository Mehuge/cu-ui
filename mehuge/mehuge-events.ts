/// <reference path="../cu/cu.ts" />
module MehugeEvents {
    var subscribers: any = {};
    var listener;

    export function sub(topic: string, handler: (...data: any[]) => void) {
        var subs = subscribers[topic] = subscribers[topic] || { listeners: [] };
        subs.listeners.push({ listener: handler });

        // first handler for any topic?  Register event handler
        if (!listener) {
            cuAPI.OnEvent(listener = function (topic: string, ...data: any[]) {
                var listeners = subscribers[topic].listeners, parsedData;
                for (var i = 0; i < listeners.length; i++) {
                    if (listeners[i].listener) {
                        listeners[i].listener(topic, data);
                    }
                }
            });
        }

        // first handler for this topic, ask client to send these events
        if (subs.listeners.length === 1) {
            cuAPI.Listen(topic);
        }
    }

    export function unsub(topic: string) {
        cuAPI.Ignore(topic);
    }

    export function pub(topic: string, ...data: any[]) {
        cuAPI.Fire(topic, data);
    }

    // fire/onevent/ignore aliases (work exactly like pub/sub/unsub)
    export var fire = pub;
    export var onevent = sub;
    export var ignore = unsub;
}