/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/// <reference path="../vendor/jquery.d.ts" />

interface JQueryStatic {
    plot: any;
}
module Perf {
    var $perf: JQuery, $config: JQuery;
    var samples = [];
    var data = {
        target: { hp: 0, max: 0 }
    };
    var graphData = [
        { label: "FPS", data: null, color: '#f00', yaxis: 1, show: true, lines: { show: true, lineWidth: 1 } },
        { label: "Particles", data: null, color: '#0f0', yaxis: 2, show: true, lines: { show: true, lineWidth: 1 } },
        { label: "Lag", data: null, color: '#00f', yaxis: 3, show: true, lines: { show: true, lineWidth: 1 } },
        { label: "HP", data: null, color: '#0ff', yaxis: 4, show: false, lines: { show: true, lineWidth: 1 } },
        { label: "TargetHP", data: null, color: '#f0f', yaxis: 5, show: false, lines: { show: true, lineWidth: 1 } },
        { label: "Speed", data: null, color: '#44f', yaxis: 5, show: false, lines: { show: true, lineWidth: 1 } },
        { label: "TCP", data: null, color: '#ff0', yaxis: 5, show: false, lines: { show: true, lineWidth: 1 } },
        { label: "UDP", data: null, color: '#f84', yaxis: 5, show: false, lines: { show: true, lineWidth: 1 } },
        { label: "New Bits", data: null, color: '#480', yaxis: 5, show: false, lines: { show: true, lineWidth: 1 } },
        { label: "Update Bits", data: null, color: '#85f', yaxis: 5, show: false, lines: { show: true, lineWidth: 1 } },
    ];

    function Paint() {
        var fps = [], particles = [], lag = [], hps = [], thps = [], speed = [], tcp = [], udp = [], nbits = [], ubits = [],
            b = samples[0].time;
        for (var i = 0; i < samples.length; i++) {
            var s = samples[i], t = (s.time - b) / 200;
            if (graphData[0].show) fps.push([t, s.fps]);
            if (graphData[1].show) particles.push([t, s.particles]);
            if (graphData[2].show) lag.push([t, s.lag]);
            if (graphData[3].show) hps.push([t, s.hp]);
            if (graphData[4].show) thps.push([t, s.thp]);
            if (graphData[5].show) speed.push([t, s.speed]);
            if (graphData[6].show) tcp.push([t, s.tcp]);
            if (graphData[7].show) udp.push([t, s.udp]);
            if (graphData[8].show) nbits.push([t, s.newBits]);
            if (graphData[9].show) ubits.push([t, s.updBits]);
        }
        var gd = [];
        var addToGraph = function(i, arr) {
            if (graphData[i].show) {
                graphData[i].data = arr;
                gd.push(graphData[i]);
                graphData[i].yaxis = gd.length;
            }
        }
        addToGraph(0, fps);
        addToGraph(1, particles);
        addToGraph(2, lag);
        addToGraph(3, hps);
        addToGraph(4, thps);
        addToGraph(5, speed);
        addToGraph(6, tcp);
        addToGraph(7, udp);
        addToGraph(8, nbits);
        addToGraph(9, ubits);
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
            hp: cuAPI.hp,
            thp: data.target.hp,
            speed: cuAPI.speed,
            tcp: cuAPI.netstats_tcpBytes,
            udp: cuAPI.netstats_udpBytes,
            newBits: cuAPI.netstats_players_newBits,
            updBits: cuAPI.netstats_players_updateBits
        };
        samples.push(sample);
        if (samples.length > 400) {
            samples.shift();
        }
        Paint();
    }

    function hideOptions() {
        $config.css({ display: 'none' });
    }

    function showOptions() {
        $config.html('');
        for (var i = 0; i < graphData.length; i++) {
            var color = graphData[i].show ? graphData[i].color : '#444';
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
            hp: 80,
            OnEnemyTargetHealthChanged: function () { }
        };
    }

    // Kickstart everything.
    setTimeout(function () {
        $perf = $('#graph');
        $config = $('#config');
        setInterval(Update, 200);
        cuAPI.OnEnemyTargetHealthChanged((health, max) => {
            data.target = { hp: health, max: max };
            console.log(JSON.stringify(data.target));
        });
        $perf.click((e) => {
            showOptions();
        });
        $config.click((e) => {
            hideOptions();
        });
    },0);
}