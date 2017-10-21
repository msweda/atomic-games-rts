const NodeClient = require('./node-client');
const Utils = require('./utils');

let ip = process.argv.length > 2 ? process.argv[2] : '127.0.0.1';
let port = process.argv.length > 3 ? process.argv[3] : '9090';
let map_width = 30;


let map = new Array(60);
for (let x = 0; x < 60; x++) {
    map[x] = new Array(60);
    for (let y = 0; y < 60; y++) {
        map [x][y] = 1;
    }
}

let visited_tiles = {};
let resources = {};
let enemy_units = {};
let enemy_base = {};

let myUnits = [];

let client = new NodeClient(ip, port, dataUpdates => {
    //console.log(dataUpdates);
    updateMap(dataUpdates, visited_tiles, enemy_units, enemy_base, dataUpdates.turn);

    // for (let y = 0; y < 60; y++) {
    //     let row = "";
    //     for (let x = 0; x < 60; x++) {
    //         row += map [x][y];
    //     }
    //     console.log(row);
    // }
    // console.log("\n\n\n\n");

    //console.log(resources);

    myUnits = updateUnits(dataUpdates, myUnits);
}, () => {

    let cmds = generateCommands(myUnits, visited_tiles, resources, enemy_units, enemy_base);
    //console.log(cmds);
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
        map[currentTile.x + map_width - 1][currentTile.y + map_width - 1] = 1;

        if (currentTile.resources != null) {
            tile_type = "resource";
            // Mark the space as not-walkable.
            // map[currentTile.x + map_width - 1][currentTile.y + map_width - 1] = 0;
        }
        else if (currentTile.blocked) {
            tile_type = "wall";
            // Mark the space as not-walkable.
            map[currentTile.x + map_width - 1][currentTile.y + map_width - 1] = 0;
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

    let updatedUnits = [];

    for (let u = 0; u < dataUpdates.unit_updates.length; u++) {
        let currentUnit = dataUpdates.unit_updates[u];
        let unit = {

        }

        updatedUnits.push(unit);
    }

    return updatedUnits;

    // let ids = units.concat(dataUpdates.unit_updates.map(u => u.id));
    // return ids.filter((val, idx) => ids.indexOf(val) === idx);
}

function generateCommands(units, visited_tiles, resources, enemy_units, enemy_base) {
    if (typeof units == 'undefined') {
        return;
    }

    let commands = [];
    for (let u = 0; u < units.length; u++) {
        unit = units[u];

        if (unit.type == 'worker') {
            console.log("HI IM A WORKER");
        }
        else if (unit.type == '')
    }

    return commands;
    // return [{
    //     command: 'MOVE',
    //     dir: ['N','E','S','W'][Math.floor(Math.random() * 4)],
    //     unit: units[Math.floor(Math.random() * units.length)]
    // }];
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
