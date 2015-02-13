/* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module MiniMap {
    export enum RequestState {
        None,
        InProgress,
        Succeeded,
        Failed
    };

    // Set color based on faction
    var factionColor = {
        'A': 'red',       // Arthurian
        'V': 'blue',      // Viking
        'T': 'green',     // Tuatha
        'C': 'orange',    // contested
        'N': 'grey'       // None
    }

    export var myFaction = 'V';
    export var myPos = { x: 200, y: 100 };

    export var controlPoints = [];
    export var spawnPoints = [];
    export var width = 256;
    export var height = 256;

    export var canvas: HTMLCanvasElement;
    var context: CanvasRenderingContext2D;

    var lastRequest;
    export var mousePos = { x: 0, y: 0 };
    export var getControlPointsState = RequestState.None;
    export var getSpawnPointsState = RequestState.None;
    var divisorX: number;
    var divisorY: number;

    export interface IPoint {
        x: number;
        y: number;
    }

    // Map Functions
    function drawCircle(x: number, y: number, r: number, fill: string): void {
        context.beginPath();
        context.arc(x, y, r, 0, 2 * Math.PI, false);
        context.fillStyle = fill;
        context.fill();
        context.lineWidth = .25;
        context.strokeStyle = '#000';
        context.stroke();
    }

    function serverToCanvasPoint(x: number, y: number): IPoint {
        return {
            x: (x + 1024) / divisorX,
            y: (-y + 1024) / divisorY
        }
    }



    export function radiusForSize(size: string): number {
        switch (size) {
            case 'S':
            default:
                return 5;
            case 'M':
                return 10;
            case 'L':
                return 15;
        }
    }

    function drawPoints(points, mouseX: number, mouseY: number): void {
        if (typeof points === 'undefined' || points === null) return;
        points.forEach(point => {
            var r = radiusForSize(point.size);
            if (point.faction === myFaction) {
                if (Math.abs(mouseX - point.x) < r &&
                    Math.abs(mouseY - point.y) < r) {
                    drawCircle(point.x, point.y, r, 'yellow');
                }
                else {
                    drawCircle(point.x, point.y, r, factionColor[point.faction]);
                }
            }
            else {
                drawCircle(point.x, point.y, r, factionColor[point.faction]);
            }
        });

    }

    export function drawMap(mousePos: IPoint): void {
        if (typeof context === 'undefined' || context == null) return;
        context.clearRect(0, 0, width, height);
        try {
            drawPoints(controlPoints, mousePos.x, mousePos.y);
        } catch (e) {
            // ignore if we fail to draw due to not having any control points
        }
        drawPoints(spawnPoints, mousePos.x, mousePos.y);

        // Draw my position
        myPos = serverToCanvasPoint(cuAPI.locationX, cuAPI.locationY);
        drawCircle(myPos.x, myPos.y, 2.5, 'white');
    }

    // API Requests
    function getControlPoints(context) {
        if (getControlPointsState === RequestState.InProgress) return null;
        getControlPointsState = RequestState.InProgress;

        var start = new Date();

        return $.ajax({
            type: 'GET',
            url: cuAPI.serverURL + '/game/controlgame'
        }).done((controlGame) => {
                getControlPointsState = RequestState.Succeeded;
                controlPoints = controlGame.controlPoints;
                if (typeof controlPoints !== 'undefined' && controlPoints !== null) {
                    controlPoints.forEach(p => {
                        var pos = serverToCanvasPoint(p.x, p.y);
                        p.x = pos.x;
                        p.y = pos.y;
                    });
                    drawMap(mousePos);
                }
            }).fail((xhr) => {
                getControlPointsState = RequestState.Failed;
                setTimeout(getControlPoints, 5000 - (new Date().getTime() - start.getTime()));
            });
    }

    function getSpawnPoints(context) {
        if (getSpawnPointsState === RequestState.InProgress) return null;

        getSpawnPointsState = RequestState.InProgress;
        var start = lastRequest = new Date();

        return $.ajax({
            type: 'GET',
            url: cuAPI.serverURL + '/game/spawnpoints'
        }).done((sp) => {
                getSpawnPointsState = RequestState.Succeeded;
                spawnPoints = sp.spawns;
                if (typeof spawnPoints !== 'undefined' && spawnPoints !== null) {
                    spawnPoints.forEach(p => {
                        p.id = "0";
                        var pos = serverToCanvasPoint(p.x, p.y);
                        p.x = pos.x;
                        p.y = pos.y;
                    });
                    drawMap(mousePos);
                }
            }).fail((xhr) => {
                getSpawnPointsState = RequestState.Failed;
                setTimeout(getControlPoints, 5000 - (new Date().getTime() - start.getTime()));
            });
    }

    export function update(mouse: IPoint) {
        mousePos = mouse;
        if (getControlPointsState !== RequestState.InProgress) getControlPoints(context);
        drawMap(mouse);
    }

    // INITIALIZE!
    export function initialize() {
        // START
        divisorX = 2048 / width;
        divisorY = 2048 / height;
        canvas = <HTMLCanvasElement> document.getElementById('map');
        context = canvas.getContext('2d');
        getControlPoints(context);
        getSpawnPoints(context);
    }

    // START

    if (cu.HasAPI()) {
        cu.OnInitialized(initialize);
        if (_.isFunction(cuAPI.OnCharacterFactionChanged)) {
            cuAPI.OnCharacterFactionChanged((newFaction: number) => {
                switch (newFaction) {
                    case 3:
                        myFaction = 'A';
                        break;
                    case 2:
                        myFaction = 'V';
                        break;
                    case 1:
                        myFaction = 'T'
                    break;
                }
            });
        }

        setInterval(() => update(mousePos),500);
    }
}