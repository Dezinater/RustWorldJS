const fs = require("fs");
const rustWorld = require("rustworldjs");

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