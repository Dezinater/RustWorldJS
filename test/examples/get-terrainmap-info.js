import * as fs from 'fs/promises';
import * as rustWorld from '../../src/index.js';

export default async function getTerrainInfo() {
	try {
		const fileContents = await fs.readFile('./test/test.map');
		const world = rustWorld.readMap(fileContents);
		console.log(world.getMapAsTerrain('terrain'));
		console.log(world.getMapAsTerrain('height'));
		console.log(world.getMapAsTerrain('water'));
		console.log(world.getMapAsTerrain('splat'));
		console.log(world.getMapAsTerrain('topology'));
		console.log(world.getMapAsTerrain('biome'));
		console.log(world.getMapAsTerrain('alpha'));
		return true;
	} catch (err) {
		throw err;
	}
}
