
/// <reference path="../vendor/jquery.d.ts" />

module Bugit {

    var report: Object;

    function addContext(report) {
        report["context"] = {
            "fps": cuAPI.fps,
            "frameTime": cuAPI.frameTime,
            "netstats_lag": cuAPI.netstats_lag,
            "netstats_tcpBytes": cuAPI.netstats_tcpBytes,
            "netstats_tcpMessages": cuAPI.netstats_tcpMessages,
            "netstats_udpBytes": cuAPI.netstats_udpBytes,
            "netstats_udpPackets": cuAPI.netstats_udpPackets,
            "netstats_players_newCount": cuAPI.netstats_players_newCount,
            "netstats_players_newBits": cuAPI.netstats_players_newBits,
            "netstats_players_udpateCount": cuAPI.netstats_players_udpateCount,
            "netstats_players_updateBits": cuAPI.netstats_players_updateBits,
            "maxHP": cuAPI.maxHP,
            "characterName": cuAPI.characterName,
            "hp": cuAPI.hp,
            "vsync": cuAPI.vsync,
            "initialized": cuAPI.initialized,
            "locationX": cuAPI.locationX,
            "locationY": cuAPI.locationY,
            "locationZ": cuAPI.locationZ,
            "speed": cuAPI.speed,
            "selfEffects": cuAPI.sideEffects,
            "abilityNumbers": cuAPI.abilityNumbers,
            "targetHP": cuAPI.targetHP,
            "targetMaxHP": cuAPI.targetMaxHP,
            "targetName": cuAPI.targetName,
            "isTargetFriendly": cuAPI.isTargetFriendly,
            "targetEffects": cuAPI.targetEffects,
            "characterID": cuAPI.characterID,
            "serverURL": cuAPI.serverURL,
            "serverTime": cuAPI.serverTime
        };
    }

    function send(retry?: number, jqXHR?: JQueryXHR) {
        var r: JQuery = $("#result");

        var failure = function (message) {
            $('#result').hide();
            $('#main').show();
            $('#error').text(message);
        };

        retry = retry | 0;
        if (retry > 5) {
            // complete failure
            failure("Could not post bug report to server, please try later");
            return;
        }

        // First attempt, build bug report
        if (retry === 0) {
            report["summary"] = $("#summary").val();
            report["description"] = $("#desc").val();
            $("#main").hide();
            r.show().text("Submitting report... ");
        } else {
            r.text("Retry " + retry + " ...");
        }

        $.ajax({
            url: "http://tracker.sorcerer.co.uk/bug.php",
            type: "post",
            data: JSON.stringify(report),
            dataType: "json",
            async: true, cache: false,
            accept: "json",
            contentType: "text/json",
            error: function (jqXHR: JQueryXHR, textStatus: string, errorThrown: string) {
                setTimeout(() => { send(++retry, jqXHR); }, 1000);
            }
        }).then(function (data) {
            if (data.status === 0) {
                $('<div>').appendTo(r.text("")).addClass("cheers").text("Cheers buddy!  Here is a reference:-");
                $('<div>').appendTo(r).addClass('big').text(data.ref);
            } else {
                failure(data.reason);
            }
        });
    }

    $(function () {

        if (typeof cuAPI === "undefined") cuAPI = {
            characterName: "Tester",
            locationX: 0,
            locationY: 0,
            locationZ: 0,
            fps: 60,
            RequestInputOwnership: () => { },
            ReleaseInputOwnership: () => { },
            CloseUI: () => {
                close();
            }
        };

        var X = (+cuAPI.locationZ).toFixed(2), Y = (+cuAPI.locationY).toFixed(2), Z = (+cuAPI.locationZ).toFixed(2);
        $("#character").text(cuAPI.characterName);
        $("#location").text("X: " + X + ", Y: " + Y + ", Z: " + Z);
        $("#fps").text(cuAPI.fps.toFixed(1));
        var inputs: JQuery = $('#desc,#summary');
        var timer;
        inputs.focus((e) => {
            if (timer) {
                clearTimeout(timer);
                timer = null;
            }
            cuAPI.RequestInputOwnership();
        });
        inputs.blur((e : JQueryEventObject) => {
            // release input ownership after a short delay, it will be cancelled if we
            // are loosing focus because we are placing focus in another field.  Otherwise
            // the release input ownership causes some focus weirdness
            timer = setTimeout(() => { cuAPI.ReleaseInputOwnership(); }, 100);
        });
        $("#close").click(() => {
            cuAPI.CloseUI("bugit");
        });
        $("#send").click(() => { send(); });

        // Pre-populate report object (based on time opened bug reported)
        report = {
            source: "bugit",
            when: (new Date()).toISOString()
        };
        if (typeof cuAPI !== "undefined") {
            addContext(report);
        }
    });

    // console.log(JSON.stringify(cuAPI));
} 