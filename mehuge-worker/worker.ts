module MehugeWorker {

    var abilities : any[] = [];

    function _findAbilityById(abilityID: string) : number {
        for (var i: number = 0; i < abilities.length; i++) {
            if (abilities[i].id === abilityID) return i;
        }
        return null;
    }

    function _init() {

        cuAPI.OnAbilityCreated((abilityID: string, ability: string) => {
            var i: number = _findAbilityById(abilityID),
                o = JSON.parse(ability);
            o.id = abilityID;
            if (i !== null) {
                abilities[i] = o;
            } else {
                abilities.push(o);
            }
        });

        cuAPI.OnAbilityDeleted((abilityID: string) => {
            var i: number = _findAbilityById(abilityID);
            if (i !== null) {
                abilities.splice(i, 1);
            }
        });
    }

    function _sortAbilities(a: any, b: any): number {
        return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
    }

    export function getAbilities (): any[] {
        abilities.sort(_sortAbilities);
        return abilities;
    }

    if (typeof cuAPI !== "undefined") {
        cuAPI.OnInitialized(() => {
            _init();
        });
    }
}; 