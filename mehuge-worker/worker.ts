
module MehugeWorker {
    var modules = {}, init = false;

    // Allow modules to register themselves with the worker.
    export function registerModule(name: string, mod: any) {
        modules[name] = mod;
        if (init) mod.start(MehugeWorker);
    };

    // listen for worker events
    export function on(topic: string, handler: (...data: any[]) => void) {
        MehugeEvents.sub(topic, handler);
    }

    export function fire(topic, ...data: any[]) {
        MehugeEvents.pub(topic, data);
    }

    // Initialise the modules
    function _init() {
        for (var mod in modules) {
            if (modules.hasOwnProperty(mod)) {
                modules[mod].start(MehugeWorker);
            }
        }
        init = true;
    }

    // Bootstrap
    if (typeof cuAPI !== "undefined") {
        cuAPI.OnInitialized(() => {
            _init();
        });
    }
}; 