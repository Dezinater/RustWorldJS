import * as fs from 'fs';
import * as rustWorld from '../../src/index.js';

import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const WORLD_SIZE = 5000;
const RADIUS = 45;
const SPACING = 25;
const WALL_SIZE = 4;

export default function generateCirclePlots() {
	let newWorld = new rustWorld.WorldData(WORLD_SIZE);
	let terrainMap = /** @type {rustWorld.TerrainMap} */ (newWorld.createEmptyTerrainMap('terrain'));
	let heightMap = /** @type {rustWorld.TerrainMap} */ (newWorld.createEmptyTerrainMap('height'));
	let waterMap = /** @type {rustWorld.TerrainMap} */ (newWorld.createEmptyTerrainMap('water'));
	let splatMap = /** @type {rustWorld.TerrainMap} */ (newWorld.createEmptyTerrainMap('splat'));
	let topologyMap = /** @type {rustWorld.TerrainMap} */ (newWorld.createEmptyTerrainMap('topology'));
	let biomeMap = /** @type {rustWorld.TerrainMap} */ (newWorld.createEmptyTerrainMap('biome'));
	let alphaMap = /** @type {rustWorld.TerrainMap} */ (newWorld.createEmptyTerrainMap('alpha'));

	for (let x = 0; x < WORLD_SIZE; x++) {
		for (let y = 0; y < WORLD_SIZE; y++) {
			terrainMap.set(16390, x, y); //16384 is base water level
			heightMap.set(16390, x, y);
			splatMap.setNormalized(1, x, y, 3); //pavement
			biomeMap.setNormalized(1, x, y, 1); //temperate biome
			alphaMap.setNormalized(1, x, y, 0);
		}
	}

	let plotSize = 2 * RADIUS + SPACING;
	let plotsAmount = Math.floor(WORLD_SIZE / plotSize);

	for (let i = 0; i < plotsAmount; i++) {
		for (let j = 0; j < plotsAmount; j++) {
			//outer circle
			floodFillCircle(terrainMap, 0.26, RADIUS, i * plotSize, j * plotSize);
			floodFillCircle(heightMap, 0.26, RADIUS, i * plotSize, j * plotSize);

			if (WALL_SIZE > 0) {
				//inner circle
				floodFillCircle(terrainMap, 0.255, RADIUS - WALL_SIZE, i * plotSize + WALL_SIZE, j * plotSize + WALL_SIZE);
				floodFillCircle(heightMap, 0.255, RADIUS - WALL_SIZE, i * plotSize + WALL_SIZE, j * plotSize + WALL_SIZE);
			}

			//remove pavement
			floodFillCircle(splatMap, 0, RADIUS, i * plotSize, j * plotSize, 3);
			//add forest
			floodFillCircle(splatMap, 1, RADIUS, i * plotSize, j * plotSize, 5);
		}
	}

	//add map to the world and encode into bytes
	newWorld.addMap('terrain', terrainMap);
	newWorld.addMap('height', heightMap);
	newWorld.addMap('splat', splatMap);
	newWorld.addMap('biome', biomeMap);
	newWorld.addMap('topology', topologyMap);
	newWorld.addMap('alpha', alphaMap);
	newWorld.addMap('water', waterMap);

	return rustWorld.writeMap(newWorld).then((bytes) => {
		return new Promise((resolve, reject) => {
			fs.writeFile(__dirname + '/test-maps/circle-plots.map', bytes, 'binary', function (err) {
				if (err) reject(err);
				resolve(true);
			});
		});
	});
}

function floodFillCircle(map, value, radius, startX, startY, channel = 0) {
	let centerX = startX + radius;
	let centerY = startY + radius;

	for (let x = startX; x < startX + radius * 2; x++) {
		for (let y = startY; y < startY + radius * 2; y++) {
			if (Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2) < radius) {
				map.setNormalized(value, x, y, channel);
			}
		}
	}
}
