const Pathfinding = require('pathfinding');

module.exports = {
    CreateMap: function(map_width, map_height) {
        // Make sure we have valid map dimensions.
        if (map_width <= 0 || map_height <= 0) {
            return null;
        }
        // Since coordinates are relative to the base, but we don't know where it spawns,
        // we need a roughly twice as big in any dimension.
        // The -1 accounts for overlap, since we want the base's coordinate to sit
        // at the exact center of this new map.
        let newMap = new Array((map_width * 2) - 1);
        for (let x = 0; x < ((map_width * 2) - 1); x++) {
            newMap[x] = new Array((map_height * 2) - 1);
            for (let y = 0; y < ((map_height * 2) - 1); y++) {
                newMap [x][y] = null;
            }
        }
        return newMap;
    },

    /* Creates a formatted string of the map. Used for debugging, because it's easier to read.
     */
     FormatMapAsString: function(map, map_width, map_height) {
         let mapString = "";
         for (let y = 0; y < (map_height * 2) - 1; y++) {
             for (let x = 0; x < (map_width * 2) - 1; x++) {
                 // Create a variable to store what should be displayed for the current tile.
                 let tileSymbol = "-";

                 // Based on what we know about the map, alter the tile symbol.
                 let currentTile = map[x][y];
                 if (currentTile === null) {
                     tileSymbol = "?";
                 }
                 else if (typeof(currentTile.units) != 'undefined' && currentTile.units.length > 0) {
                     tileSymbol = "U";
                 }
                 else if (currentTile.resources != null) {
                     tileSymbol = "R";
                 }
                 else if (currentTile.blocked) {
                     tileSymbol = "W";
                 }

                 // Add the tile symbol to the output string.
                 mapString = mapString.concat(tileSymbol);
             }
             // Advance to the next line, so the display will appear as a matrix.
             mapString = mapString.concat("\n");
         }
         return mapString;
     },

    /* Given a coordinate relative to the base,
     * returns a coordinate that can be used as an index into the map array.
     *
     * coord: an integer value relative to the base in some dimension.
     * coord_dimension_length: an integer value for the length of the map dimension coord refers to.
     * (for instance in a 60x30 grid, coord_dimension_length would be 60 if coord is an x value)
     */
    ToAbsoluteCoordinate: function(coord, coord_dimension_length) {
        return coord + coord_dimension_length - 1;
    },

    /* Given the map, creates a representation of where a unit can / cannot move.
     */
    CreatePFGrid: function(map, map_width, map_height) {
        // Make sure we have valid map dimensions.
        if (map_width <= 0 || map_height <= 0) {
            return null;
        }
        // Since coordinates are relative to the base, but we don't know where it spawns,
        // we need a roughly twice as big in any dimension.
        // The -1 accounts for overlap, since we want the base's coordinate to sit
        // at the exact center of this new map.
        let newPFGrid = new Array((map_width * 2) - 1);
        for (let x = 0; x < ((map_width * 2) - 1); x++) {
            newPFGrid[x] = new Array((map_height * 2) - 1);
            for (let y = 0; y < ((map_height * 2) - 1); y++) {
                // Set the map as not walkable anywhere there is a wall.
                // Technically, resources are also not walkable, but we need to navigate to them,
                // so pretend we can walk on them.
                let currentTile = map[x][y];
                if (currentTile.resources == null && currentTile.blocked) {
                    newPFGrid [x][y] = 1;
                }
                else {
                    newPFGrid [x][y] = 0;
                }
            }
        }
        return newPFGrid;
    },

    /* Creates a formatted string of the pathfinding grid.
     */
    FormatPFGridAsString: function(PFGrid, map_width, map_height) {
        let PFGridString = "";
        for (let y = 0; y < (map_height * 2) - 1; y++) {
            for (let x = 0; x < (map_width * 2) - 1; x++) {
                // Add the tile symbol to the output string.
                PFGridString = PFGridString.concat(PFGrid[x][y]);
            }
            // Advance to the next line, so the display will appear as a matrix.
            PFGridString = PFGridString.concat("\n");
        }
        return PFGridString;
    },

    ResourcesOnMap: function(map) {
        
    }
}
