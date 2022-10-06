let lz4 = require("./lz4/lz4.js");
import { BLOCK_SIZE, ChunkFlags } from "./LZ4Helper";

let writePosition = 0;
let currentOutput = new Array(0);

addEventListener('message', e => {
    writePosition = 0;
    
    let { index, bytes } = e.data;
    currentOutput = new Array(bytes.byteLength);

    let compressed = new Array(BLOCK_SIZE);
    let compressedLength = lz4.compressBlock(bytes, compressed, 0, bytes.byteLength, new Uint32Array(1 << 14));
    compressed = compressed.slice(0, compressedLength);

    if (compressedLength <= 0 || compressedLength >= BLOCK_SIZE) {
        // incompressible block
        compressed = bytes;
        compressedLength = bytes.byteLength;
    }

    let isCompressed = compressedLength < BLOCK_SIZE;
    let flags = ChunkFlags.None;

    if (isCompressed) flags |= ChunkFlags.Compressed;
    WriteVarInt(flags);
    WriteVarInt(bytes.byteLength);
    if (isCompressed) WriteVarInt(compressedLength);

    let finalOutput = new Uint8Array(writePosition + compressedLength);
    finalOutput.set(new Uint8Array(currentOutput.slice(0, writePosition)), 0);
    finalOutput.set(new Uint8Array(compressed), writePosition);

    postMessage({ index, bytes: finalOutput });
});

function WriteVarInt(value) {
    let bufferVal;
    
    while (true) {
        let b = (value & 0x7F);
        value >>= 7;
        bufferVal = (b | (value == 0 ? 0 : 0x80));
        currentOutput[writePosition] = bufferVal;
        writePosition++;
        if (value == 0) break;
    }
}