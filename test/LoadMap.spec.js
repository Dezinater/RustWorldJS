import assert from 'assert';
import * as fs from 'fs';

import { readMap, writeMap, WorldData } from '../src/index.js';

/** @type WorldData */
let loadedMap;

describe('Load Map', function () {
	this.timeout(15000);

	before(function (done) {
		fs.readFile('./test/test.map', function (err, fileContents) {
			if (err) throw err;
			loadedMap = readMap(fileContents);
			done();
		});
	});

	describe('Map Values', function () {
		it('should have a size of 2000', function () {
			assert.equal(loadedMap.size, 2000);
		});
	});

	describe('Map Contents', function () {
		it('should contain a terrain map', function () {
			assert.notEqual(loadedMap.getMapAsTerrain('terrain'), undefined);
		});

		it('should contain a height map', function () {
			assert.notEqual(loadedMap.getMapAsTerrain('height'), undefined);
		});

		it('should contain a water map', function () {
			assert.notEqual(loadedMap.getMapAsTerrain('water'), undefined);
		});

		it('should contain a splat map', function () {
			assert.notEqual(loadedMap.getMapAsTerrain('splat'), undefined);
		});

		it('should contain a topology map', function () {
			assert.notEqual(loadedMap.getMapAsTerrain('topology'), undefined);
		});

		it('should contain a biome map', function () {
			assert.notEqual(loadedMap.getMapAsTerrain('biome'), undefined);
		});

		it('should contain a alpha map', function () {
			assert.notEqual(loadedMap.getMapAsTerrain('alpha'), undefined);
		});
	});
});
