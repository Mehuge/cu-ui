/// <reference path="../vendor/jquery.d.ts" />
module Rest {
    // Basic promise API
    export function Promise(fn) {
        var then,
            rejected,
            context,
            self = this,
            fulfill = function () {
                if (then) {
                    then.apply(context, arguments);
                }
            },
            reject = function () {
                if (rejected) {
                    rejected.apply(context, arguments);
                }
            };
        setTimeout(function () { context = fn(fulfill, reject) || this; }, 0);
        return {
            then: function (fn, fnr) {
                then = fn;
                rejected = fnr;
            },
            resolve: function () {
                fulfill.apply(self, arguments);
            },
            reject: function () {
                reject.apply(self, arguments);
            }
        };
    }

    export function call(verb, params) {
        var serverURI = (typeof cuAPI == "undefined" ? {} : cuAPI).serverURL || "http://chat.camelotunchained.com:8000/api/";

        // Raw call the CU RESI API, returns a promise
        params = params || {};
        return Promise(function (fulfill, reject) {
            return $.ajax({
                url: serverURI + verb,
                type: params.type || "GET",
                data: params.query,
                async: true, cache: false,
                accepts: params.accepts || "text/json",
                contentType: params.contentType,
                error: function (jqXHR: JQueryXHR, textStatus: String, errorThrown: String) {
                    reject(textStatus, errorThrown, jqXHR);
                }
            }).done(function (data) {
                fulfill(data);
            });
        });
    }

    export function getKills(query) {
        return call("kills", { type: "GET", query: query });
    }
}