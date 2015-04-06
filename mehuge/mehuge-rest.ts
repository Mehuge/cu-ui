/// <reference path="../vendor/jquery.d.ts" />
/// <reference path="../cu/cu.ts" />

declare var Promise: any;
declare var $: JQueryStatic;

module MehugeRest {

    var servers: any[] = [], server: string = "Hatchery";

    function getServerInfo(server?: string): any {
        var domain: string = "camelotunchained.com";
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

    function getServerURI(verb: string) {
        var host: string, port: number = 8000, protocol: string = "http:";
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

    export function call(verb: string, params?: any) {
        var serverURI = getServerURI(verb);

        // Raw call the CU RESI API, returns a promise
        params = params || {};
        return new Promise(function (fulfill: (data: any) => void, reject: (status: string, errorThrown: string, jqXHR: JQueryXHR) => void) {
            $.ajax({
                url: serverURI + verb,
                type: params.type || "GET",
                data: params.query,
                async: true, cache: false,
                accepts: params.accepts || "text/json",
                timeout: params.timeout,
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
        return new Promise(function (fulfill: (data: any) => void, reject: (status: string, errorThrown: string, jqXHR: JQueryXHR) => void) {
            call("servers").then(function (list: any[]) {
                servers = list;
                fulfill(servers);
            }, reject);
        });
    }

    export function getFactions() {
        return call("game/factions", { timeout: 2000 });
    }

    export function getRaces() {
        return call("game/races", { timeout: 2000 });
    }

    export function getPlayers() {
        return call("game/players", { timeout: 2000 });
    }

    export function getControlGame(query: any) {
        return call("game/controlgame", { query: query, timeout: 2000 });
    }

    export function getBanes() {
        return call("game/banes");
    }

    export function getBoons() {
        return call("game/boons");
    }

    export function getAttributes() {
        return call("game/attributes");
    }

    export function getCharacters(loginToken: string) {
        return call("characters", { query: { loginToken: loginToken } });
    }

    export function getAbilities() {
        return call("abilities");
    }

    export function getCraftedAbilities(query: any) {
        return call("craftedabilities", { query: query });
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

    export function getKills(query: any) {
        return call("kills", { query: query });
    }

}