/// <reference path="../vendor/jquery.d.ts" />

var Rest;
(function (Rest) {
    var servers = [], server = "Hatchery";

    function getServerInfo(server) {
        var domain = "camelotunchained.com";
        if (server) {
            for (var i = 0; i < servers.length; i++) {
                if (servers[i].name === server) {
                    return servers[i];
                }
            }
            return {
                host: (server === "Hatchery" ? "chat" : server.toLowerCase()) + "." + domain
            };
        }
        return {
            host: "api.citystateentertainment.com"
        };
    }

    function getServerURI(verb) {
        var host, port = 8000, protocol = "http:";
        switch (verb) {
            case "servers":
                port = 8001;
                host = getServerInfo().host;
                break;
            case "characters":
                protocol = "https:";
                port = 4443;
                host = getServerInfo(server).host;
                break;
            default:
                if (typeof cuAPI !== "undefined" && "serverURL" in cuAPI)
                    return cuAPI.serverURL;
                host = getServerInfo(server).host;
                break;
        }
        return protocol + "//" + host + ":" + port + "/api/";
    }

    function call(verb, params) {
        var serverURI = getServerURI(verb);

        // Raw call the CU RESI API, returns a promise
        params = params || {};
        return new Promise(function (fulfill, reject) {
            $.ajax({
                url: serverURI + verb,
                type: params.type || "GET",
                data: params.query,
                async: true, cache: false,
                accepts: params.accepts || "text/json",
                contentType: params.contentType,
                error: function (jqXHR, textStatus, errorThrown) {
                    reject(textStatus, errorThrown, jqXHR);
                }
            }).done(function (data) {
                fulfill(data);
            });
        });
    }
    Rest.call = call;

    function selectServer(name) {
        server = name;
    }
    Rest.selectServer = selectServer;

    function getServers() {
        return new Promise(function (fulfill, reject) {
            call("servers").then(function (list) {
                servers = list;
                fulfill(servers);
            }, reject);
        });
    }
    Rest.getServers = getServers;

    function getFactions() {
        return call("game/factions");
    }
    Rest.getFactions = getFactions;

    function getRaces() {
        return call("game/races");
    }
    Rest.getRaces = getRaces;

    function getPlayers() {
        return call("game/players");
    }
    Rest.getPlayers = getPlayers;

    function getControlGame() {
        return call("game/controlgame");
    }
    Rest.getControlGame = getControlGame;

    function getBanes() {
        return call("game/banes");
    }
    Rest.getBanes = getBanes;

    function getBoons() {
        return call("game/boons");
    }
    Rest.getBoons = getBoons;

    function getCharacters(loginToken) {
        return call("characters", { query: { loginToken: loginToken } });
    }
    Rest.getCharacters = getCharacters;

    function getAbilities() {
        return call("abilities");
    }
    Rest.getAbilities = getAbilities;

    function getPatchNotes() {
        return call("patchnotes");
    }
    Rest.getPatchNotes = getPatchNotes;

    function getBanners() {
        return call("banners");
    }
    Rest.getBanners = getBanners;

    function getEvents() {
        return call("scheduledevents");
    }
    Rest.getEvents = getEvents;

    function getKills(query) {
        return call("kills", { query: query });
    }
    Rest.getKills = getKills;
})(Rest || (Rest = {}));
//# sourceMappingURL=rest.js.map
