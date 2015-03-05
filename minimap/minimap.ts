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
    export var factionSelectors = {
        'A': 'art',           // Arthurian
        'V': 'vik',          // Viking
        'T': 'tdd',         // Tuatha
        'C': 'contest',    // contested
        'N': 'none'       // None
    }

    var sizeToImage = {
        'S': 'zone.png',
        'M': 'duck-zone.png',
        'L': 'duck-mid.png'
    }

    var sizeToWidth = {
        'S': 18,
        'M': 34,
        'L': 50
    }

    export var myFaction = 'V';
    export var myPos = { x: 200, y: 100 };

    export var controlPoints = [];
    export var spawnPoints = [];
    export var width = 256;
    export var height = 256;
    export var iconScale = 1.0;

    export var updateFunction = null;

    var lastRequest;
    export var mousePos = { x: 0, y: 0 };
    export var getControlPointsState = RequestState.None;
    export var getSpawnPointsState = RequestState.None;
    var divisorX: number;
    var divisorY: number;

    var cpOnce = false;

    var map = $('#map');

    export interface IPoint {
        x: number;
        y: number;
    }

    export function serverToCanvasPoint(x: number, y: number): IPoint {
        return {
            x: (x + 1024) / divisorX,
            y: (-y + 1024) / divisorY
        }
    }

    export function radiusForSize(size: string): number {
        switch (size) {
            case 'S':
            case 'small':
            default:
                return 9 * iconScale;
            case 'M':
            case 'medium':
            case 'spawn':
                return 17 * iconScale;
            case 'L':
            case 'large':
                return 25 * iconScale;
        }
    }

    function getImageForControlPoint(cp): string {
        var width = sizeToWidth[cp.size] * iconScale;

        var img = "<img style='position:absolute; top:" + (cp.y - width * 0.5);
        img += "px; left:" + (cp.x - width * 0.5) + "px;'";
        img += " width='" + width + "px' height='" + width + "px'";
        img += " respawnID='" + cp.id + "'";
        img += " id='" + cp.id + "'";
        img += " class='" + factionSelectors[cp.faction] + "'";
        img += " src='../images/minimap/" + sizeToImage[cp.size] + "'></img>";
        return img;
    }

    function getImageForSpawnPoint(cp): string {
        var width = 30 * iconScale;
        var img = "<img style='position:absolute; top:" + (cp.y - width * 0.5);
        img += "px; left:" + (cp.x - width * 0.5) + "px;'";
        img += " width='" + width + "px' height='" + width + "px'";
        img += " id='spawn" + cp.faction + "'";
        img += " class='" + factionSelectors[cp.faction] + "'";
        img += " src='../images/minimap/main-zone.png'></img>";
        return img;
    }

    function getImageForPlayer(x: number, y: number, alive: boolean): string {
        var img = "<img style='position:absolute; top:" + y;
        img += "px; left:" + x + "px;'";
        img += " id='playerPos'";
        img += " class='player'";
        if (alive) {
            img += " src='../images/minimap/player.png'></img>";
        } else {
            img += " src='../images/minimap/player-dead.png'></img>";
        }
        return img;
    }

    export function drawMap(): void {
        // update map
        controlPoints.forEach(cp => {
            var temp = $('#' + cp.id);
            temp.removeClass();
            temp.addClass(factionSelectors[cp.faction]);
        });
        // Draw my position
        myPos = serverToCanvasPoint(cuAPI.locationX, cuAPI.locationY);

        var p = $('#playerPos');
        p.css('top', myPos.y - 5);
        p.css('left', myPos.x - 5);
    }

    // API Requests
    function getControlPoints() {
        if (getControlPointsState === RequestState.InProgress) return null;
        getControlPointsState = RequestState.InProgress;

        var start = new Date();

        return $.ajax({
            type: 'GET',
            url: cuAPI.serverURL + '/game/controlgame'
        }).done((controlGame) => {
            getControlPointsState = RequestState.Succeeded;

            if (!_.isArray(controlGame.controlPoints)) return;

            controlPoints = controlGame.controlPoints;

            controlPoints.forEach(p => {
                var pos = serverToCanvasPoint(p.x, p.y);
                p.x = pos.x;
                p.y = pos.y;
            });

            if (!cpOnce && !isNaN(controlPoints[0].x) && typeof (controlPoints[0].x) !== "undefined") {
                controlPoints.forEach(p => {
                    map.append(getImageForControlPoint(p));
                });
                cpOnce = true;

                map.append(getImageForPlayer(myPos.x, myPos.y, true));
            } else {
                updateFunction();
            }
        }).fail(() => {
            getControlPointsState = RequestState.Failed;
            setTimeout(getControlPoints, 5000 - (new Date().getTime() - start.getTime()));
        });
    }

    function getSpawnPoints() {
        if (getSpawnPointsState === RequestState.InProgress) return null;

        getSpawnPointsState = RequestState.InProgress;
        lastRequest = new Date();

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
                spawnPoints.forEach(p => {
                    map.append(getImageForSpawnPoint(p));
                });
            }
        }).fail(() => {
            getSpawnPointsState = RequestState.Failed;
        });
    }

    export function update(mouse: IPoint) {
        mousePos = mouse;
        if (getControlPointsState !== RequestState.InProgress) getControlPoints();
        updateFunction();
    }

    // INITIALIZE!
    export function initialize() {
        // START
        divisorX = 2048 / width;
        divisorY = 2048 / height;
        getControlPoints();
        getSpawnPoints();

        myPos = serverToCanvasPoint(cuAPI.locationX, cuAPI.locationY);
    }

    // START

    if (cu.HasAPI()) {
        iconScale = 0.5;
        updateFunction = drawMap;
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
                        myFaction = 'T';
                    break;
                }
            });
        }

        setInterval(() => update(mousePos), 500);
    }
}