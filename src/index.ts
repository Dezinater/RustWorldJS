import { WorldData } from './rust/WorldData.js';
import LZ4Reader from './LZ4Reader.js';
import TerrainMap from './rust/TerrainMap.js';
import TextMap from './rust/TextMap.js';
import LZ4Writer from './LZ4Writer.js';

export { WorldData, TerrainMap, TextMap, LZ4Reader };

export function readMap(bytes: ArrayBuffer) {
    let rawBytes = new Uint8Array(bytes).slice(4, bytes.byteLength);
    let stream = new LZ4Reader(rawBytes);
    return WorldData.decode(stream.getOutput());
}

export function writeMap(bytes: WorldData) {
    let encoded = WorldData.encode(bytes).finish();
    let writer = new LZ4Writer(encoded);
    return writer.getOutput();
}