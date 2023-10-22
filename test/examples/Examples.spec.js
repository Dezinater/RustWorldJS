import assert from 'assert';
import { readMap } from '../../src/index.js';
import * as fs from 'fs/promises';
import generate_circle_plots from './scripts/generate-circle-plots.js';
import generate_ice_walls from './scripts/ice-walls.js';

describe('Examples', function () {
	this.timeout(120000);

	it('Generating circle plots', async function () {
		assert.equal(await generate_circle_plots(), true);
	});

	it('Generating ice walls', async function () {
		assert.equal(await generate_ice_walls(), true);
	});

	it('Get Terrain info', async function () {
		try {
			const fileContents = await fs.readFile('./test/test.map');
			const world = readMap(fileContents);
			console.log(world.getMapAsTerrain('terrain'));
			console.log(world.getMapAsTerrain('height'));
			console.log(world.getMapAsTerrain('water'));
			console.log(world.getMapAsTerrain('splat'));
			console.log(world.getMapAsTerrain('topology'));
			console.log(world.getMapAsTerrain('biome'));
			console.log(world.getMapAsTerrain('alpha'));
			assert.equal(true, true);
		} catch (err) {
			throw err;
		}
	});
});
