const assert = require('assert');
const Utils = require('./utils');

// Test Map Creation.

let map0 = Utils.CreateMap(0, 0);
assert(map0 == null, "1.0: CreateMap Failed 0x0 test.");

let map1 = Utils.CreateMap(-3, -2);
assert(map1 == null, "1.1: CreateMap Failed negative text.");

let map2 = Utils.CreateMap(3, 3);
assert(map2.length == 5, "1.2: CreateMap Failed 3x3 X test.");
for (let i = 0; i < map2.length; i++) {
    assert(map2[i].length == 5, "1.2: CreateMap Failed 3x3 Y test.");
}

let map3 = Utils.CreateMap(30, 30);
assert(map3.length == 59, "1.3 CreateMap Failed 30x30 X test.");
for (let i = 0; i < map3.length; i++) {
    assert(map3[i].length == 59, "1.3: CreateMap Failed 30x30 Y test.");
}

let map4 = Utils.CreateMap(10, 50);
assert(map4.length == 19, "1.4 CreateMap Failed 10x50 X test.");
for (let i = 0; i < map4.length; i++) {
    assert(map4[i].length == 99, "1.4: CreateMap Failed 10x50 Y test.");
}

let map5 = Utils.CreateMap(70, 20);
assert(map5.length == 139, "1.5 CreateMap Failed 70x20 X test.");
for (let i = 0; i < map5.length; i++) {
    assert(map5[i].length == 39, "1.5: CreateMap Failed 70x20 Y test.");
}

// Test Map Output

assert(Utils.FormatMapAsString(map2, 3, 3) == "?????\n?????\n?????\n?????\n?????\n");
