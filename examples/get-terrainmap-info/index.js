import * as fs from "fs";
import * as rustWorld from "rustworldjs";
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

fs.readFile(__dirname + '/../../test/test.map', function (err, fileContents) {
    let world = rustWorld.readMap(fileContents);
    console.log(`Size: ${world.size}`);

    console.log(world.getMapAsTerrain("terrain"));
    console.log(world.getMapAsTerrain("height"));
    console.log(world.getMapAsTerrain("water"));
    console.log(world.getMapAsTerrain("splat"));
    console.log(world.getMapAsTerrain("topology"));
    console.log(world.getMapAsTerrain("biome"));
    console.log(world.getMapAsTerrain("alpha"));
});