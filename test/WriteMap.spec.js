import assert from 'assert';
import * as fs from 'fs';

import { readMap, writeMap, WorldData } from '../src/index.js';

/** @type WorldData */
let loadedMap;

describe('Write Map', function () {
	this.timeout(15000);

	before(function (done) {
		fs.readFile('./test/test.map', function (err, fileContents) {
			if (err) throw err;
			loadedMap = readMap(fileContents);
			done();
		});
	});

	it('Writing...', async function () {
		const data = await writeMap(loadedMap);
		fs.writeFile('./test/test-write.map', data, 'binary', function (err, res) {
			if (err) throw err;
			assert.equal(true, true);
		});
	});

	after(function (done) {
		fs.unlink('./test/test-write.map', (err) => {
			if (err) throw err;
			done();
		});
	});
});
