/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/// <reference path="../vendor/jquery.d.ts" />

interface JQueryStatic {
    plot: any;
}
module Perf {
    var CONFIG_NAME = "mehuge-perf-config";
    var $perf: JQuery, $config: JQuery;
    var samples = [];
    var data = {
        hp: 0,
        stamina: 0,
        target: { hp: 0, max: 0 }
    };
    var CLS = { CPS: 1, PARTICLES: 2, MS: 3, HP: 4, SPEED: 5, BYTES: 6, BITS: 7, STAMINA: 8 };
    var colors = ['#fff', '#0f0', '#00f', '#ff0', '#0ff', '#f00', '#80f', '#f08', '#f80', '#08f', '#888', '#487'];

    var graphData = [
        { cls: CLS.CPS, label: "FPS", show: true, lines: { show: true, lineWidth: 1 } },
        { cls: CLS.PARTICLES, label: "Particles", show: true, lines: { show: true, lineWidth: 1 } },
        { cls: CLS.MS, label: "Lag", show: true, lines: { show: true, lineWidth: 1 } },
        { cls: CLS.HP, label: "HP", show: false, lines: { show: true, lineWidth: 1 } },
        { cls: CLS.STAMINA, label: "Stamina", show: false, lines: { show: true, lineWidth: 1 } },
        { cls: CLS.HP, label: "TargetHP", show: false, lines: { show: true, lineWidth: 1 } },
        { cls: CLS.SPEED, label: "Speed", show: false, lines: { show: true, lineWidth: 1 } },
        { cls: CLS.SPEED, label: "H.Speed", show: true, lines: { show: true, lineWidth: 1 } },
        { cls: CLS.BYTES, label: "TCP", show: false, lines: { show: true, lineWidth: 1 } },
        { cls: CLS.BYTES, label: "UDP", show: false, lines: { show: true, lineWidth: 1 } },
        { cls: CLS.BITS, label: "New Bits", show: false, lines: { show: true, lineWidth: 1 } },
        { cls: CLS.BITS, label: "Update Bits", show: false, lines: { show: true, lineWidth: 1 } },
    ];

    function loadConfig() {
        var config = localStorage.getItem(CONFIG_NAME);
        if (config) {
            try {
                config = JSON.parse(config);
            } catch (e) {
                config = null;
            }
        }
        if (config) {
            for (var i = 0; i < graphData.length; i++) {
                var entry = graphData[i];
                if (config[entry.label]) {
                    graphData[i].show = config[entry.label].show;
                }
            }
        }
    }

    function saveConfig() {
        var config = {};
        for (var i = 0; i < graphData.length; i++) {
            var entry = graphData[i];
            config[entry.label] = { show: entry.show };
        }
        localStorage.setItem(CONFIG_NAME, JSON.stringify(config));
    }

    function Paint() {
        var fps = [], particles = [], lag = [], hps = [], stamina = [], thps = [], speed = [], hspeed = [], tcp = [], udp = [], nbits = [], ubits = [],
            b = samples[0].time;
        for (var i = 0; i < samples.length; i++) {
            var s = samples[i], t = (s.time - b) / 200;
            if (graphData[0].show) fps.push([t, s.fps]);
            if (graphData[1].show) particles.push([t, s.particles]);
            if (graphData[2].show) lag.push([t, s.lag]);
            if (graphData[3].show) hps.push([t, s.hp]);
            if (graphData[4].show) stamina.push([t, s.stamina]);
            if (graphData[5].show) thps.push([t, s.thp]);
            if (graphData[6].show) speed.push([t, s.speed]);
            if (graphData[7].show) hspeed.push([t, s.hspeed]);
            if (graphData[8].show) tcp.push([t, s.tcp]);
            if (graphData[9].show) udp.push([t, s.udp]);
            if (graphData[10].show) nbits.push([t, s.newBits]);
            if (graphData[11].show) ubits.push([t, s.updBits]);
        }
        var gd = [], ax = {}, nextAxis = 1;
        var addToGraph = function (i, arr) {
            if (graphData[i].show) {
                graphData[i]["data"] = arr;
                gd.push(graphData[i]);
                graphData[i]["yaxis"] = ax[graphData[i].cls] = (ax[graphData[i].cls] || nextAxis++);
                graphData[i]["color"] = colors[i];
            }
        }
        addToGraph(0, fps);
        addToGraph(1, particles);
        addToGraph(2, lag);
        addToGraph(3, hps);
        addToGraph(4, stamina);
        addToGraph(5, thps);
        addToGraph(6, speed);
        addToGraph(7, hspeed);
        addToGraph(8, tcp);
        addToGraph(9, udp);
        addToGraph(10, nbits);
        addToGraph(11, ubits);
        $.plot($("#graph"), gd, {
            yaxis: { position: "left", color: 'black' },
            yaxes: [{}],
            xaxis: { position: "bottom", color: 'black' },
            grid: { show: true, markings: true, borderWidth: 0, backgroundColor: { colors: ['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.3)'] } },
            legend: {
                show: false
            }
        });
    }

    // Update function.  This gathers the samples the grapher will show.
    function Update() {
        var sample = {
            time: Date.now(),
            particles: cuAPI.particlesRenderedCount,
            fps: cuAPI.fps,
            lag: cuAPI.netstats_lag,
            hp: data.hp,
            stamina: data.stamina,
            thp: data.target.hp,
            speed: cuAPI.speed,
            hspeed: cuAPI.horizontalSpeed,
            tcp: cuAPI.netstats_tcpBytes,
            udp: cuAPI.netstats_udpBytes,
            newBits: cuAPI.netstats_players_newBits,
            updBits: cuAPI.netstats_players_updateBits
        };
        samples.push(sample);
        if (samples.length > 400) {
            samples.shift();
        }
        $("#graph")[0].offsetHeight > 0 && Paint();
    }

    function hideOptions() {
        $config.css({ display: 'none' });
        saveConfig();
    }

    function showOptions() {
        $config.html('');
        for (var i = 0; i < graphData.length; i++) {
            var color = graphData[i].show ? graphData[i]["color"] : '#444';
            var $div: JQuery = $('<div>').attr({ "class": "option" }).css({ backgroundColor: color }).text(graphData[i].label).appendTo($config);
            if (graphData[i].show) $div.addClass("on");
            (function($div : JQuery, opt) {
                $div.click((e : JQueryEventObject) => {
                    opt.show = !opt.show;
                    if (opt.show) {
                        $div.addClass("on");
                        $div.css({ backgroundColor: opt.color });
                    } else {
                        $div.removeClass("on");
                        $div.css({ backgroundColor: '#444' });
                    }
                    e.stopPropagation();
                })
            })($div, graphData[i]);
        }
        $config.css({ display: 'block' });
    }

    if (typeof cuAPI === "undefined") {
        window["cuAPI"] = {
            particlesRenderedCount: 100,
            fps: 120,
            netstats_lag: 145,
            OnEnemyTargetHealthChanged: function () { },
            OnEnemyCharacterHealthChanged: function () { },
            OnCharacterStaminaChanged: function () { },
            OnInitialised: function (callback) {
                setTimeout(callback, 0);
            }
        };
    } else {
    }

    // Kickstart everything.
    cuAPI.OnInitialized(function () {
        loadConfig();
        cuAPI.CloseUI("perfhud");
        $perf = $('#graph');
        $config = $('#config');
        setInterval(Update, 200);
        cuAPI.OnEnemyTargetHealthChanged((health, max) => { data.target = { hp: health, max: max }; });
        cuAPI.OnCharacterHealthChanged((health: number, maxHealth: number) => { data.hp = health; });
        cuAPI.OnCharacterStaminaChanged((stamina: number, maxStamina: number) => { console.log('stamina ' + (data.stamina = stamina)); });
        $perf.click((e) => {
            showOptions();
        });
        $config.click((e) => {
            hideOptions();
        });
    });
}