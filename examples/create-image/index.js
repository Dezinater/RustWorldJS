import * as fs from "fs";
import * as rustWorld from "../../src/index.js";
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

fs.readFile(__dirname + '/../../test/test.map', async function (err, fileContents) {
    let world = rustWorld.readMap(fileContents);
    let image = await world.createImage();

    const buffer = Buffer.from(image.split(",")[1], 'base64');
    fs.writeFileSync(__dirname + "/image.png", buffer);
});