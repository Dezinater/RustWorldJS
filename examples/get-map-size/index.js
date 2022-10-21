import * as fs from "fs";
import * as rustWorld from "rustworld";
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

fs.readFile(__dirname + '/../../test/test.map', function (err, fileContents) {
    let world = rustWorld.readMap(fileContents);
    console.log(`Size: ${world.size}`);
});