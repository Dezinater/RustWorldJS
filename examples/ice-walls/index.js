const fs = require("fs");
const rustWorld = require("rustworldjs");

fs.readFile(__dirname + '/../../test/test.map', function (err, fileContents) {
    let world = rustWorld.readMap(fileContents);

    let terrainMap = world.getTerrainMap("terrain");
    let splatMap = world.getTerrainMap("splat");
    let center = splatMap.res / 2; //x and y are same since maps are always square

    fillCircleNegative(terrainMap, center, 420, 255, 1);
    fillCircleNegative(splatMap, center, 420, 255, 1);
});

function fillCircleNegative(map, center, radius, value, channel = 0) {
    for (let x = 0; x < map.res; x++) {
        for (let y = 0; y < map.res; y++) {
            if (Math.sqrt((x - center) ** 2 + (y - center) ** 2) > radius) {
                map.set(value, x, y, channel);
            }
        }
    }
}