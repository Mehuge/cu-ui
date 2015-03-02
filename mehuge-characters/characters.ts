/// <reference path="../vendor/jquery.d.ts" />
/// <reference path="../../cu-rest/rest.ts" />
module Characters {
    function grid(className) {
        var result: JQuery = $('#result');
        return $('<div/>').appendTo(result).addClass(className);
    }

    interface Child {
        id: string;
        label: string;
    }

    function item(content : JQuery, type : string, children : Child[]) {
        var el = $('<div/>').appendTo(content).addClass(type);
        for (var i = 0; i < children.length; i++) {
            $('<div/>').appendTo(el).attr('id', children[i].id).text(children[i].label);
        }
    }

    function init() {
        var loginToken = typeof cuAPI === "undefined" || !cuAPI.loginToken ? window.prompt('loginToken?') : cuAPI.loginToken;
        Rest.getCharacters(loginToken).then(function (characters) {
            var el: JQuery = grid("characters");
            item(el, "character", [
                { id: "faction", label: 'Faction' },
                { id: "race", label: 'Race' },
                { id: "name", label: 'Name' }
            ]);
            for (var i = 0; i < characters.length; i++) {
                item(el, "character", [
                    { id: "faction", label: characters[i].faction.name },
                    { id: "race", label: characters[i].race.name },
                    { id: "name", label: characters[i].name }
                ]);
            }
        });
    }

    $(window).load(() => {
        if (typeof cuAPI !== 'undefined') {
            alert('wait');
            cuAPI.OnInitialized(init);  // required for loginToken
            $('#close').click(() => { cuAPI.CloseUI("mehuge-characters"); });
        } else {
            $('#close').css('display', 'none')
            init();
        }
    });
};