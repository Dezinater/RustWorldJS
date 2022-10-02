const fs = require("fs");
const rustWorld = require("rustworldjs");

fs.readFile(__dirname + '/../../test/test.map', function (err, fileContents) {
    let world = rustWorld.readMap(fileContents);
    console.log(`Size: ${world.size}`);
});