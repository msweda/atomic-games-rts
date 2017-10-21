const NodeClient = require('./node-client');
var PF = require('pathfinding');

let ip = process.argv.length > 2 ? process.argv[2] : '0.0.0.0';
let port = process.argv.length > 3 ? process.argv[3] : '9090';
let map_width = 30;

let map = new Array(60);
for (let x = 0; x < 60; x++) {
    map[x] = new Array(60);
    for (let y = 0; y < 60; y++) {
        map [x][y] = 0;
    }
}

let visited_tiles = {};
let resources = {};
let enemy_units = {};
let enemy_base = {};
let myUnits = {};
let paths = {};

// Moving from x,y to x2, y2
function findDirection(x1, y1, x2, y2) {
    let dir = "";
    if (x2 - x1 > 0) {
        dir = "E";
    }
    else if (x2 - x1 < 0){
        dir = "W";
    }
    else if (y2 - y1 > 0) {
        dir = "S";
    }
    else if (y2 - y1 < 0) {
        dir = "N";
    }
    return dir;
}

function findPathToResource(unit) {
    // Create a graph from the map.
    let graph = new PF.Grid(map);
    // Find the starting position.
    let startX = unit.x + map_width - 1;
    let startY = unit.y + map_width - 1;
    // Get the first available resource.
    let nextResource = resources[Object.keys(resources)[0]];
    // Find the location of that resource.
    let endX = nextResource.x + map_width - 1;
    let endY = nextResource.y + map_width - 1;
    // Search for a route to the resource.
    let finder = new PF.AStarFinder();
    let path = finder.findPath(startX, startY, endX, endY, graph);

    paths[unit.id] = {
        path: path,
        step: 0
    }
}

function findPathToBase(unit) {
    // Create a graph from the map.
    let graph = new PF.Grid(map);
    // Find the starting position.
    let startX = unit.x + map_width - 1;
    let startY = unit.y + map_width - 1;
    // Find the location of the base.
    let endX = map_width - 1;
    let endY = map_width - 1;
    // Search for a route to the resource.
    let finder = new PF.AStarFinder();
    let path = finder.findPath(startX, startY, endX, endY, graph);

    paths[unit.id] = {
        path: path,
        step: 0
    }
}

let client = new NodeClient(ip, port, dataUpdates => {
    updateMap(dataUpdates, visited_tiles, enemy_units, enemy_base, dataUpdates.turn);
    updateUnits(dataUpdates, myUnits);
}, () => {

    let cmds = generateCommands(myUnits, visited_tiles, resources, enemy_units, enemy_base);
    return cmds;
});

function updateMap(dataUpdates, visited_tiles, enemy_units, enemy_base, currentTurn) {
    if (typeof dataUpdates.tile_updates == 'undefined') {
        return;
    }

    for (let i = 0; i < dataUpdates.tile_updates.length; i++) {
        let currentTile = dataUpdates.tile_updates[i];

        // If the tile is not yet known, add it.
        if (!(currentTile.x in visited_tiles)) {
            visited_tiles[currentTile.x] = {};
        }
        if (!(currentTile.y in visited_tiles[currentTile.x])) {
            visited_tiles[currentTile.x][currentTile.y] = {};
        }

        // Set which turn the tile was visited.
        visited_tiles[currentTile.x][currentTile.y].visitedOnTurn = currentTurn;
        // Set the tipe type for later reference.
        let tile_type = "free";
        // Mark the space as walkable.
        map[currentTile.x + map_width - 1][currentTile.y + map_width - 1] = 0;

        if (currentTile.resources != null) {
            tile_type = "resource";
            // Mark the space as not-walkable.
            // map[currentTile.x + map_width - 1][currentTile.y + map_width - 1] = 0;
        }
        else if (currentTile.blocked) {
            tile_type = "wall";
            // Mark the space as not-walkable.
            map[currentTile.x + map_width - 1][currentTile.y + map_width - 1] = 1;
            // Reset paths.
            paths = {};
        }
        else if (typeof currentTile.units != 'undefined') {
            if (currentTile.units.length > 0) {
                tile_type = "enemy units";
            }
        }

        visited_tiles[currentTile.x][currentTile.y].tile_type = tile_type;

        // Add the tile to the relevant map.
        if (tile_type == "resource") {
            resources[currentTile.resources.id] = {
                x: currentTile.x,
                y: currentTile.y,
                type: currentTile.resources.type,
                total: currentTile.resources.total,
                value: currentTile.resources.value
            };
        }
        else if (tile_type == "enemy units") {
            for (let u = 0; u < currentTile.units.length; u++) {
                currentUnit = currentTile.units[u];
                if (currentUnit.type == "base") {
                    enemy_base.x = currentTile.x;
                    enemy_base.y = currentTile.y;
                }
                else {
                    enemy_units[currentUnit.id] = {
                          x: currentTile.x,
                          y: currentTile.y,
                          type: currentUnit.type,
                          status: currentUnit.status,
                          health: currentUnit.health
                    };
                }
            }
        }
    }
}

function updateUnits(dataUpdates, units) {
    if (typeof dataUpdates.unit_updates == 'undefined') {
        return;
    }

    for (let u = 0; u < dataUpdates.unit_updates.length; u++) {
        let currentUnit = dataUpdates.unit_updates[u];
        units[currentUnit.id] = currentUnit;
    }

    // let ids = units.concat(dataUpdates.unit_updates.map(u => u.id));
    // return ids.filter((val, idx) => ids.indexOf(val) === idx);
}

function generateCommands(units, visited_tiles, resources, enemy_units, enemy_base) {
    if (typeof units == 'undefined') {
        return;
    }

    let commands = [];
    for (let unitId in units) {
        let unit = units[unitId];

        if (unit.type == 'base') {
        }
        else if (unit.type == 'worker') {
            if (unit.resource > 0) {

                commands.push({
                   command: 'MOVE',
                   dir: ['N','E','S','W'][Math.floor(Math.random() * 4)],
                   unit: unit.id
                });

                // if (typeof paths[unit.id] == 'undefined' || paths[unit.id] == null) {
                //     findPathToBase(unit);
                // }
                //
                // let step = paths[unit.id].step;
                //
                // if (step < paths[unit.id].path.length) {
                //     let shipX = unit.x + map_width - 1;
                //     let shipY = unit.y + map_width - 1;
                //     let nextPoint = paths[unit.id].path[step];
                //     let nextX = nextPoint[0];
                //     let nextY = nextPoint[1];
                //     let nextDirection = findDirection(shipX, shipY, nextX, nextY);
                //     paths[unit.id].step++;
                //
                //     commands.push({
                //         command: 'MOVE',
                //         dir: nextDirection,
                //         unit: unit.id
                //     });
                // }
            }
            else {
                if (unit.status == 'idle') {
                    if (Object.keys(resources).length == 0) {
                        return [{
                            command: 'MOVE',
                            dir: ['N','E','S','W'][Math.floor(Math.random() * 4)],
                            unit: unit.id
                        }];
                    }
                    else {
                        if (typeof paths[unit.id] == 'undefined' || paths[unit.id] == null) {
                            findPathToResource(unit);
                        }

                        let step = paths[unit.id].step;

                        if (step < paths[unit.id].path.length) {
                            let shipX = unit.x + map_width - 1;
                            let shipY = unit.y + map_width - 1;
                            let nextPoint = paths[unit.id].path[step];
                            let nextX = nextPoint[0];
                            let nextY = nextPoint[1];
                            let nextDirection = findDirection(shipX, shipY, nextX, nextY);
                            paths[unit.id].step++;

                            if (paths[unit.id].step == paths[unit.id].path.length) {
                                commands.push({
                                    command: 'GATHER',
                                    dir: nextDirection,
                                    unit: unit.id
                                });

                                paths[unit.id] = null;
                            }
                            else {
                                commands.push({
                                    command: 'MOVE',
                                    dir: nextDirection,
                                    unit: unit.id
                                });
                            }
                        }
                    }
                }
                else if (unit.status == 'moving') {
                }
            }
        }
        else if (unit.type == 'scout') {
        }
        else if (unit.type == 'tank') {

        }
    }

    return commands;
}

/* Structure...
visited_tiles = {
    x = {
        y = {
            tile_type: string,
            visitedOnTurn: int
        }
    }
}

based on tile_type, search on one of the following...

resources = {
    tile.resources.id = {
        x: int,
        y: int,
        type: string,
        total: int,
        value: int
    }
}

enemy_units = {
    tile.units.id = {
        x: int,
        y: int,
        type: string,
        status: string,
        health: int
    }
}

enemy_base = {
    x: int,
    y: int
}
*/
