var assert = require('assert');
var fs = require('fs');

import { readMap, WorldData } from "../src/index";

let loadedMap: WorldData;

describe('Load Map', function () {
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
            assert.notEqual(loadedMap.getTerrainMap("terrain"), undefined);
        });
        
        it('should contain a height map', function () {
            assert.notEqual(loadedMap.getTerrainMap("height"), undefined);
        });
        
        it('should contain a water map', function () {
            assert.notEqual(loadedMap.getTerrainMap("water"), undefined);
        });
        
        it('should contain a splat map', function () {
            assert.notEqual(loadedMap.getTerrainMap("splat"), undefined);
        });
        
        it('should contain a topology map', function () {
            assert.notEqual(loadedMap.getTerrainMap("topology"), undefined);
        });
        
        it('should contain a biome map', function () {
            assert.notEqual(loadedMap.getTerrainMap("biome"), undefined);
        });

        it('should contain a alpha map', function () {
            assert.notEqual(loadedMap.getTerrainMap("alpha"), undefined);
        });
    });
});
