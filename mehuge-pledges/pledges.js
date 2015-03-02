
function renderGraph(tracker) {
    function parseDate(s) {
        s = s.split(/[- :]/);
        var d = new Date();
        d.setFullYear(s[0]);
        d.setMonth(s[1] - 1);
        d.setDate(s[2]);
        d.setHours(s[3]);
        d.setMinutes(s[4]);
        d.setSeconds(s[5]);
        return d;
    }

    var d1 = [], d2 = [], d3 = [], d4 = [], d5 = [], rows = tracker.data, interval = tracker.interval, length,
        goal = tracker.goals[0].goal, current = rows[rows.length - 1][1] | 0, need = goal - current;

    // extract our sample data
    var l = rows.length,
        pos = document.getElementById("position").value | 0,
        zoom = document.getElementById("zoom").value | 0;

    document.getElementById("zoomlevel").textContent = (zoom / 100);

    // if zoom is 200% then we want to display 1/2 the data! (100/200)
    var slen = (l * (100 / zoom)) | 0, spos = ((l - slen) * pos / 100) | 0;
    rows = rows.slice(spos, spos + slen);

    // Sample start/amount
    var startDate = parseDate(rows[0][0]), start = startDate.valueOf(), startAmount = rows[0][1] | 0;

    document.getElementById("samplestart").textContent = rows[0][0];

    window.title = 'Stretch Goal: ' + tracker.name;
    $("#stretch").text(tracker.goals[0].name);
    $("#stretch2").text(tracker.goals[0].name);
    $("#goal").text(goal);
    $("#current").text(current);
    $("#need").text(need);
    var ra = 0, sampleLength = 14 * 24;
    for (var x = 0; x < rows.length; x++) {
        var row = rows[x], d = Math.round((parseDate(row[0]).valueOf() - start) / 1000 / 60 / 60);
        d1.push([d, row[2] | 0]);

        // find the goal for this time period
        var tg = goal;
        for (var i = tracker.goals.length - 1; i > 0; i--) {
            if (tracker.goals[i].goal > row[1] | 0) {
                tg = tracker.goals[i].goal;
                break;
            }
        }

        d2.push([d, tg - row[1] | 0]);
        if (x > 0) {
            ra = ((ra * (x - 1)) + rows[x][2]) / x;
            d4.push([d, ra | 0]);
        } else {
            ra = rows[x][2];
            d4.push([d, ra | 0]);
        }
        if (x >= sampleLength) {
            d5.push([d, (((rows[x][1] | 0) - (rows[x - sampleLength][1] | 0)) / sampleLength) | 0]);
        } else {
            d5.push([d, 0]);
        }
    }
    var hours = rows.length, hourly = (rows[rows.length - 1][1] - startAmount) / hours, crate, proj, finish = new Date();
    document.getElementById("spanhours").textContent = +(Math.round((hours / 24) + "e+2") + "e-2");
    for (var x = 0; x < d2.length; x++) {
        d3.push([d2[x][0], hourly | 0]);
    }
    if (d5.length >= sampleLength) {
        for (var x = 0; x < sampleLength; x++) {
            d5[x] = [d2[x][0], d5[sampleLength][1]];
        }
        crate = d5[d5.length - 1][1];
    } else {
        crate = hourly | 0;
    }

    var fday = (hours / 24) >= 14;

    proj = need / crate;
    $('#rate').html(crate);
    finish.setMinutes(0);
    finish.setSeconds(0);
    finish.setHours(finish.getHours() + proj);
    $('#eta').html(finish.toUTCString());
    $('#in').html(proj < 24 ? (proj | 0) + ' hours' : ((((proj * 10) / 24) | 0) / 10) + " days");
    var data = [
        { label: "$ Pledged/hour", data: d1, color: '#f00', yaxis: 1, lines: { show: true, lineWidth: 1 } },
        { label: "$ Running Average", data: d4, color: '#8f4', yaxis: 1, lines: { show: true, lineWidth: 1 } },
        { label: "$ Average Rate", data: d3, color: '#00f', yaxis: 1, lines: { show: true, lineWidth: 1 } },
        { label: "$ Needed for " + tracker.name, data: d2, color: '#ff0', yaxis: 2, lines: { show: true, lineWidth: 4 } },
        { label: "$ 14 Day Running Avg", data: d5, color: '#4ee2ec', yaxis: 1, lines: { show: fday, lineWidth: 4 } },
    ];

    $.plot($("#graph"), data, {
        yaxis: { position: "left" },
        yaxes: [{}],
        xaxis: { position: "bottom" },
        grid: { backgroundColor: { colors: ['#fff', '#eee'] } },
        legend: {
            position: "ne"
        }
    });
}

window.addEventListener("load", function () {
    renderGraph(_cu_tracker);
});

var d = new Date();
d.setHours(d.getHours() + 1);
d.setMinutes(0);
d.setSeconds(0);
// reload page just after the next hour varied by about a minute
var interval = d.valueOf() - (new Date()).valueOf() + Math.random(60000) + 2000;
window.setTimeout(function () {
    location.reload();
}, interval | 0);

// Attach handlers to sliders
var rgt, position = document.getElementById("position");
position.onchange = function () {
    if (rgt) clearTimeout(rgt);
    rgt = setTimeout(function () { renderGraph(_cu_tracker); }, 100);
};
var zgt, zoom = document.getElementById("zoom");
zoom.onchange = function () {
    if (zgt) clearTimeout(zgt);
    zgt = setTimeout(function () { renderGraph(_cu_tracker); }, 100);
    renderGraph(_cu_tracker);
};

function MouseWheel(e) {
    var render;
    if (e.detail) {
        e.wheelDelta = e.detail;
        e.wheelDeltaX = e.wheelDeltaY = 0;
        if (e.shiftKey) e.wheelDeltaX = e.detail; else e.wheelDeltaY = e.detail;
    }
    if (e.wheelDeltaY != 0) {
        position.value = (position.value | 0) + (e.wheelDeltaY < 0 ? -1 : 1);
        render = true;
    }
    if (e.wheelDeltaX != 0) {
        zoom.value = (zoom.value | 0) + (e.wheelDeltaX < 0 ? -100 : +100);
        render = true;
    }
    if (render) renderGraph(_cu_tracker);
    e.preventDefault();
};

document.getElementById("graph").addEventListener("mousewheel", MouseWheel, false);
document.getElementById("graph").addEventListener("DOMMouseScroll", MouseWheel, false);
