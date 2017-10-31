const Pathfinding = require('pathfinding');
const NodeClient = require('./node-client');
const Utils = require('./utils');

let ip = process.argv.length > 2 ? process.argv[2] : '127.0.0.1';
let port = process.argv.length > 3 ? process.argv[3] : '9090';

// Information about the game.
let gameInfo;
let map;
let mapUnits = {};

// Variables to control strategy.
let currentStrategy;

const STRAT_EXPLORE = 0;
const STRAT_MINE = 1;
const STRAT_ATTACK = 2;
const STRAT_DEFEND = 3;

// Base strategy variables.
let countToCreate = {
    workers: 0,
    scouts: 0,
    tanks: 0
};
let isWaitingToBuild = false;

// // Worker strategy variables.
// let workerActionWeights = {
//     move: 10,
//     gather: 10,
//     melee: 10
// };

// Create a node client that will receive/send instructions from/to the server.
let client = new NodeClient(ip, port, dataUpdates => {
    // If this is the first turn, initialize the game.
    if (dataUpdates.turn == 0) {
        initGame(dataUpdates);
    }
    updateMap(dataUpdates, map);
    updateUnits(dataUpdates, mapUnits);
}, () => {
    let cmds = generateCommands(map, mapUnits);
    return cmds;
});

function changeStrategyTo(newStrategy) {
    // Set variables according to the new strategy.
    if (newStrategy == STRAT_EXPLORE) {
        countToCreate.scouts = 4;
    }
    else if (newStrategy == STRAT_MINE) {

    }
    else if (newStrategy == STRAT_ATTACK) {

    }
    else if (newStrategy == STRAT_DEFEND) {

    }
    return newStrategy;
}

function initGame(dataUpdates) {
    // Store initial game info for later use.
    gameInfo = dataUpdates.game_info;

    // Initialize the map.
    map = Utils.CreateMap(gameInfo.map_width, gameInfo.map_height);

    // Set the initial strategy.
    currentStrategy = changeStrategyTo(STRAT_EXPLORE);

}

function updateMap(dataUpdates, map) {
    // For debugging input.
    //console.log(dataUpdates.tile_updates);

    // Loop through each tile update.
    for (let i = 0; i < dataUpdates.tile_updates.length; i++) {
        // Declare a variable for easy reference of the current tile.
        let currentTile = dataUpdates.tile_updates[i];
        // Overwrite the map info.
        let currentTileX = Utils.ToAbsoluteCoordinate(currentTile.x, gameInfo.map_width);
        let currentTileY = Utils.ToAbsoluteCoordinate(currentTile.y, gameInfo.map_height);
        // If we can see the tile, store all the known information.
        if (currentTile.visible == true) {
            map[currentTileX][currentTileY] = currentTile;
        }
        // However, if we lost sight of the tile, don't forget what we knew.
        else {
            // Since this message is only given to tiles that we already know about,
            // just change the visible value to false.
            map[currentTileX][currentTileY].visible = false;
        }
    }
    // For debugging output.
    //console.log(Utils.FormatMapAsString(map, gameInfo.map_width, gameInfo.map_height));
}

function updateUnits(dataUpdates, units) {
    // Update my units based on data updates
    for (let i = 0; i < dataUpdates.unit_updates.length; i++) {
        let currentUnit = dataUpdates.unit_updates[i];

        // Update the units object.
        units[currentUnit.id] = currentUnit;

        // If the unit died, remove it from the object.
        if (currentUnit.status == 'dead') {
            delete units[currentUnit.id];
        }
    }
}

function generateCommands(map, units) {
    let commands = [];

    for (unitId in units) {
        let currentUnit = units[unitId];
        let currentCommand = null;

        switch (currentUnit.type) {
            case 'base':
                currentCommand = generateBaseCommand(currentUnit);
                break;
            case 'worker':
                currentCommand = generateWorkerCommand(currentUnit);
                break;
            case 'scout':
                currentCommand = generateScoutCommand(currentUnit);
                break;
            case 'tank':
                currentCommand = generateTankCommand(currentUnit);
                break;
            default:
                break;
        }

        if (currentCommand != null) {
            commands.push(currentCommand);
        }
    }

    return commands;
}

function generateBaseCommand(currentUnit) {
    if (currentUnit.status != "building") {
        if (!isWaitingToBuild) {
            isWaitingToBuild = true;

            if (countToCreate.workers > 0) {
                countToCreate.workers = countToCreate.workers - 1;
                return {
                    command: 'CREATE',
                    type: 'worker'
                };
            }
            else if (countToCreate.scouts > 0) {
                countToCreate.scouts = countToCreate.scouts - 1;
                return {
                    command: 'CREATE',
                    type: 'scout'
                };
            }
            else if (countToCreate.tanks > 0) {
                countToCreate.tanks = countToCreate.tanks - 1;
                return {
                    command: 'CREATE',
                    type: 'tank'
                };
            }
        }
    }
    else {
        isWaitingToBuild = false;
    }
}

function generateWorkerCommand(currentUnit) {
    return {
        command: 'MOVE',
        dir: ['N','E','S','W'][Math.floor(Math.random() * 4)],
        unit: currentUnit.id
    };
}

function generateScoutCommand(currentUnit) {
    if (currentStrategy == STRAT_EXPLORE) {
        return {
            command: 'MOVE',
            dir: ['N','E','S','W'][Math.floor(Math.random() * 4)],
            unit: currentUnit.id
        };
    }
    else if (currentStrategy == STRAT_MINE) {

    }
    else if (currentStrategy == STRAT_ATTACK) {

    }
    else if (currentStrategy == STRAT_DEFEND) {

    }
}

function generateTankCommand(currentUnit) {
    return {
        command: 'MOVE',
        dir: ['N','E','S','W'][Math.floor(Math.random() * 4)],
        unit: currentUnit.id
    };
}
