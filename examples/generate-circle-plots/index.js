const fs = require("fs");
const rustWorld = require("rustworldjs");

const WORLD_SIZE = 2000;
const RADIUS = 10;
const SPACING = 20;

main();
function main() {
    let newWorld = new rustWorld.WorldData(WORLD_SIZE);
    let terrainMap = newWorld.createEmptyTerrainMap("terrain", 1025);
    let heightMap = newWorld.createEmptyTerrainMap("height", 1025);
    let waterMap = newWorld.createEmptyTerrainMap("water", 1025);
    let splatMap = newWorld.createEmptyTerrainMap("splat", 1024);
    let topologyMap = newWorld.createEmptyTerrainMap("topology", 1024);
    let biomeMap = newWorld.createEmptyTerrainMap("biome", 725);
    let alphaMap = newWorld.createEmptyTerrainMap("alpha", 1024);

    let plotSize = 2 * RADIUS + SPACING;
    let plotsAmount = Math.floor(WORLD_SIZE / plotSize);

    for (let i = 0; i < plotsAmount; i++) {
        for (let j = 0; j < plotsAmount; j++) {
            floodFillCircle(terrainMap, RADIUS, i * plotSize, j * plotSize);
            floodFillCircle(splatMap, RADIUS, i * plotSize, j * plotSize, 1);
        }
    }

    newWorld.addMap("terrain", terrainMap);
    newWorld.addMap("height", heightMap);
    newWorld.addMap("water", waterMap);
    newWorld.addMap("splat", splatMap);
    newWorld.addMap("topology", topologyMap);
    newWorld.addMap("biome", biomeMap);
    newWorld.addMap("alpha", alphaMap);

    rustWorld.writeMap(newWorld).then(x => {
        fs.writeFile('circle-plots.map', x, "binary", function (err) {
            if (err) return console.log(err);
            console.log("Finished generating map!")
        });
    });
}

function floodFillCircle(map, radius, startX, startY, channel = 0) {
    let centerX = startX + radius;
    let centerY = startY + radius;

    for (let x = startX; x < startX + (radius * 2); x++) {
        for (let y = startY; y < startY + (radius * 2); y++) {
            if (Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2) < radius) {
                map.setNormalized(0.6, x, y, channel);
            }
        }
    }
}