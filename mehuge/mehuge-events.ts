module MehugeEvents {
    var subscribers: any = {};
    var listener;
/*
    export function sub(topic: string, handler: (data: any) => void) {
        var subs = subscribers[topic] = subscribers[topic] || { listeners: [] };
        subs.listeners.push({ listener: handler });

        // first handler for any topic?  Register event handler
        if (!listener) {
            cuAPI.OnEvent(listener = function (topic: string, data: any) {
                var listeners = subscribers[topic].listeners, parsedData;
                try {
                    parsedData = JSON.parse(data);
                } catch (e) {
                    parsedData = data;
                }
                for (var i = 0; i < listeners.length; i++) {
                    if (listeners[i].listener) {
                        listeners[i].listener(event, parsedData);
                    }
                }
            });
        }

        // first handler for this topic, ask client to send these events
        if (subs.handlers.length === 1) {
            cuAPI.Listen(topic);
        }
    }

    export function pub(topic: string, data: any) {
        cuAPI.Fire(topic, JSON.stringify(data));
    }
*/
}