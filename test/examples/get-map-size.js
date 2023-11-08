import * as fs from 'fs/promises';
import * as rustWorld from '../../src/index.js';

export default async function getMapSize() {
	try {
		const fileContents = await fs.readFile('./test/test.map');
		const world = rustWorld.readMap(fileContents);
		console.log(`Size: ${world.size}`);
		return true;
	} catch (err) {
		throw err;
	}
}
