import { WorldData, WorldData_pb } from './rust/WorldData.js';
import LZ4Reader from './LZ4Reader.js';
import TerrainMap from './rust/TerrainMap.js';
import TextMap from './rust/TextMap.js';
import LZ4Writer from './LZ4Writer.js';

export { WorldData, TerrainMap, TextMap, LZ4Reader };

/**
 * 
 * @param {ArrayBuffer} bytes 
 * @returns {WorldData}
 */
export function readMap(bytes) {
    let rawBytes = new Uint8Array(bytes).slice(4, bytes.byteLength);
    let stream = new LZ4Reader(rawBytes);
    return new WorldData(undefined, stream.getOutput()) //WorldData.decode(stream.getOutput()); //what it should be
}

/**
 * 
 * @param {WorldData} bytes 
 * @returns {Promise<unknown>}
 */
export function writeMap(bytes) {
    let encoded = WorldData.encode(bytes).finish();
    let writer = new LZ4Writer(encoded);
    return writer.getOutput();
}