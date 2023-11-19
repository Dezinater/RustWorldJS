import * as fs from 'fs/promises';
import * as rustWorld from '../../src/index.js';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = join(dirname(fileURLToPath(import.meta.url)), '..');

export default async function generate_ice_walls() {
	try {
		const fileContents = await fs.readFile(__dirname + '/test.map');

		let world = rustWorld.readMap(fileContents);

		let terrainMap = world.getMapAsTerrain('terrain'); //decode the map as a terrain object
		let splatMap = world.getMapAsTerrain('splat');
		let center = world.size / 2; //x and y are same since maps are always square

		fillCircle(terrainMap, center, 420, world.size, 0.4);
		fillSplatsCircle(splatMap, center, 420, world.size);

		//encode the terrain objects back into bytes
		if (terrainMap) world.setMap('terrain', terrainMap);
		if (splatMap) world.setMap('splat', splatMap);

		try {
			const bytes = await rustWorld.writeMap(world);
			await fs.writeFile(__dirname + '/examples/test-maps/ice-walls.map', bytes, 'binary');
			return true;
		} catch (err) {
			throw err;
		}
	} catch (err) {
		throw err;
	}
}

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
