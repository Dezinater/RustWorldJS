const fs = require("fs");
const rustWorld = require("rustworldjs");

const inputMapFile = "/../../test/test"; //don't include map extension here

fs.readFile(__dirname + inputMapFile + '.map', function (err, fileContents) {
    let world = rustWorld.readMap(fileContents);

    let terrainMap = world.getTerrainMap("terrain");
    let splatMap = world.getTerrainMap("splat");
    let center = splatMap.res / 2; //x and y are same since maps are always square

    fillCircleNegative(terrainMap, center, 420, 1);
    fillCircleNegative(splatMap, center, 420, 1, 1);

    rustWorld.writeMap(world).then(bytes => {
        fs.writeFile(__dirname + inputMapFile + '-ice-wall.map', bytes, "binary", function (err) {
            if (err) return console.log(err);
            console.log("Finished creating ice walls!")
        });
    });
});

function fillCircleNegative(map, center, radius, value, channel = 0) {
    for (let x = 0; x < map.res; x++) {
        for (let y = 0; y < map.res; y++) {
            if (Math.sqrt((x - center) ** 2 + (y - center) ** 2) > radius) {
                map.setNormalized(value, x, y, channel);
            }
        }
    }
}