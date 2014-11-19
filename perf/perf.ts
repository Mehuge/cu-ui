/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/// <reference path="../vendor/jquery.d.ts" />

interface JQueryStatic {
    plot: any;
}
module Perf {
    var $perf: JQuery;
    var samples = [];

    function Paint() {
        var fps = [], particles = [], lag = [], b = samples[0].time;
        for (var i = 0; i < samples.length; i++) {
            var s = samples[i], t = (s.time - b) / 200;
            fps.push([t, s.fps]);
            particles.push([t, s.particles]);
            lag.push([t, s.lag]);
        }
        var data = [
            { label: "FPS", data: fps, color: '#f00', yaxis: 1, lines: { show: true, lineWidth: 1 } },
            { label: "Particles", data: particles, color: '#0f0', yaxis: 2, lines: { show: true, lineWidth: 1 } },
            { label: "Lag", data: lag, color: '#00f', yaxis: 3, lines: { show: true, lineWidth: 1 } },
        ];
        $.plot($("#graph"), data, {
            yaxis: { position: "left", color: 'black' },
            yaxes: [{}],
            xaxis: { position: "bottom", color: 'black' },
            grid: { show: true, markings: true, borderWidth: 0, backgroundColor: { colors: ['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.3)'] } },
            legend: {
                show: false
            }
        });
    }

    function Update() {
        var sample = {
            time: Date.now(),
            particles: cuAPI.particlesRenderedCount,
            fps: cuAPI.fps,
            lag: cuAPI.netstats_lag,
        };
        samples.push(sample);
        if (samples.length > 400) {
            samples.shift();
        }
        Paint();
    }
    setTimeout(function () {
        $perf = $('#graph');
        setInterval(Update, 200);
    }, 2000);
}