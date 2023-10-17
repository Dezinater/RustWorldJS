import * as fs from "fs";
import * as rustWorld from "../../src/index.js";
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const inputMapFile = "/../../test/test"; //don't include map extension here

fs.readFile(__dirname + inputMapFile + '.map', function (err, fileContents) {
    let world = rustWorld.readMap(fileContents);

    let terrainMap = world.getMapAsTerrain("terrain"); //decode the map as a terrain object
    let splatMap = world.getMapAsTerrain("splat");
    let center = world.size / 2; //x and y are same since maps are always square

    fillCircle(terrainMap, center, 420, world.size, 0.4);
    fillSplatsCircle(splatMap, center, 420, world.size);

    //encode the terrain objects back into bytes
    if (terrainMap) world.setMap("terrain", terrainMap); 
    if (splatMap) world.setMap("splat", splatMap);

    rustWorld.writeMap(world).then(bytes => {
        fs.writeFile(__dirname + inputMapFile + '-ice-wall.map', bytes, "binary", function (err) {
            if (err) return console.log(err);
            console.log("Finished creating ice walls!")
        });
    });
});

function fillCircle(map, center, radius, size, value, channel = 0) {
    for (let x = 0; x < size; x++) {
        for (let y = 0; y < size; y++) {
            if (Math.sqrt((x - center) ** 2 + (y - center) ** 2) > radius) {
                map.setNormalized(value, x, y, channel);
            }
        }
    }
}

function fillSplatsCircle(map, center, radius, size) {
    for (let x = 0; x < size; x++) {
        for (let y = 0; y < size; y++) {
            if (Math.sqrt((x - center) ** 2 + (y - center) ** 2) > radius) {
                map.setNormalized(0, x, y, 0);
                map.setNormalized(1, x, y, 1); //snow
                map.setNormalized(0, x, y, 2);
                map.setNormalized(0, x, y, 3);
                map.setNormalized(0, x, y, 4);
                map.setNormalized(0, x, y, 5);
                map.setNormalized(0, x, y, 6);
                map.setNormalized(0, x, y, 7);
            }
        }
    }
}