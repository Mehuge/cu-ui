/// <reference path="../vendor/jquery.d.ts" />
declare var Promise: any;

module Rest {

    var servers = [], server: string = "Hatchery";

    function getServerInfo(server?: string) {
        if (server) {
            for (var i = 0; i < servers.length; i++) {
                if (servers[i].name === server) {
                    return servers[i];
                }
            }
        }
        return {
            host: "chat.camelotunchained.com"
        };
    }

    function getServerURI(verb: string) {
        var host: string, port: number = 8000 , protocol : string = "http:";
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
                if (typeof cuAPI !== "undefined" && "serverURL" in cuAPI) return cuAPI.serverURL;
                host = getServerInfo(server).host;
                break;
        }
        return protocol + "//" + host + ":" + port + "/api/";
    }

    export function call(verb, params?) {
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
                error: function (jqXHR: JQueryXHR, textStatus: string, errorThrown: string) {
                    reject(textStatus, errorThrown, jqXHR);
                }
            }).done(function (data) {
                fulfill(data);
            });
        });
    }

    export function selectServer(name: string) {
        server = name;
    }

    export function getServers() {
        return new Promise(function (fulfill, reject) {
            call("servers").then(function (list) {
                servers = list;
                fulfill(servers);
            },reject);
        });
    }

    export function getFactions() {
        return call("game/factions");
    }

    export function getRaces() {
        return call("game/races");
    }

    export function getPlayers() {
        return call("game/players");
    }

    export function getCharacters(loginToken: string) {
        return call("characters", { query: { loginToken: loginToken } });
    }

    export function getAbilities() {
        return call("abilities");
    }

    export function getPatchNotes() {
        return call("patchnotes");
    }

    export function getBanners() {
        return call("banners");
    }

    export function getEvents() {
        return call("scheduledevents");
    }

    export function getKills(query) {
        return call("kills", { query: query });
    }

    // pre-load server list
    getServers();
}