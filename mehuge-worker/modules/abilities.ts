module WM_Abilities {

    var abilities: any[] = [];
    var notify: any[] = [];
    var sorted = false;

    function _findAbilityById(abilityID: string): number {
        for (var i: number = 0; i < abilities.length; i++) {
            if (abilities[i].id === abilityID) return i;
        }
        return null;
    }

    export function start(worker: any) {

        this.worker = worker;

        cuAPI.OnAbilityCreated((abilityID: string, ability: string) => {
            var i: number = _findAbilityById(abilityID),
                o = JSON.parse(ability);
            o.id = abilityID;
            if (i !== null) {
                abilities[i] = o;
            } else {
                abilities.push(o);
                sorted = false;
            }
            worker.fire("mehuge-worker::abilities-updated");
        });

        cuAPI.OnAbilityDeleted((abilityID: string) => {
            var i: number = _findAbilityById(abilityID);
            if (i !== null) {
                abilities.splice(i, 1);
                worker.fire("mehuge-worker::abilities-updated");
            }
        });

        cuAPI.OnCharacterIDChanged((id: string) => {
            MehugeRest.getCraftedAbilities({ loginToken: cuAPI.loginToken, characterID: id })
                .then((data: any) => {
                    abilities = data;
                    sorted = false;
                    worker.fire("mehuge-worker::abilities-updated");
                });
        });

        // Send abilities to interested parties
        var _sendAbilities = function () {
            if (!sorted) sortAbilities();
            var topic = notify.shift();
            while (topic) {
                worker.fire(topic, abilities);
                topic = notify.shift();
            }
        };

        // Listen for requests for abilities, register their interest and send them if they are
        // already available.
        worker.on("mehuge-worker::get-abilities", (topic: string, ...data: any[]) => {
            notify.push(topic);
            if (abilities.length) _sendAbilities();
        });

        // Listen for our own abilities updated event, and tell any interested parties currently
        // waiting.
        worker.on("mehuge-worker::abilities-updated", () => {
            _sendAbilities();
        });
    }

    function sortAbilities() : void {
        abilities.sort((a: any, b: any): number => {
            return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
        });
        sorted = true;
    }

    // Register our worker module
    MehugeWorker.registerModule("abilities", WM_Abilities);
}
 