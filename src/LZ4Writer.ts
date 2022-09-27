let lz4 = require("./lz4/lz4.js");
import { Worker } from 'worker_threads';

new Worker(new URL('./worker.js', import.meta.url));
//let lz4 = require("lz4js");
import { BLOCK_SIZE } from "./LZ4Helper";
import { ChunkFlags } from "./LZ4Helper";
import { memcpy } from "./LZ4Helper";

export default class LZ4Writer {
    bytes: ArrayBuffer;
    dataview: DataView;
    _bufferOffset: number;
    _buffer: Uint8Array;
    _bufferLength: number;
    currentOutput: Uint8Array;
    readPosition: number;
    writePosition: number;
    canRead: boolean;
    finalOutput: Uint8Array;
    finalChunks: Array<number>[];

    constructor(bytes: ArrayBuffer) {
        this.readPosition = 0;
        this.writePosition = 0;
        this.canRead = true;
        this.bytes = bytes;
        this.currentOutput = new Uint8Array(new ArrayBuffer(this.bytes.byteLength));

        while (this.canRead) {
            this.FlushCurrentChunk();
            console.log("Flushed " + this.readPosition + " " + this.writePosition + " " + this.bytes.byteLength);
        }

        this.currentOutput = this.currentOutput.slice(0, this.writePosition);
    }

    FlushCurrentChunk() {
        let compressed = new Array(BLOCK_SIZE);
        let size = Math.min(this.bytes.byteLength - this.readPosition, BLOCK_SIZE);
        //console.log(size);
        let compressedLength = lz4.compressBlock(this.bytes, compressed, this.readPosition, size, new Uint32Array(1 << 14));
        compressed = compressed.slice(0, compressedLength);
        this.readPosition += size;
        //console.log(compressed);
        //console.log(compressedLength);

        if (compressedLength <= 0 || compressedLength >= BLOCK_SIZE) {
            // incompressible block
            //compressed = this.bytes;
            compressedLength = this.bytes.byteLength;
        }

        var isCompressed = compressedLength < BLOCK_SIZE;
        var flags = ChunkFlags.None;

        if (isCompressed) flags |= ChunkFlags.Compressed;

        this.WriteVarInt(flags);
        //this.WriteVarInt(BLOCK_SIZE);
        this.WriteVarInt(size);
        if (isCompressed) this.WriteVarInt(compressedLength);

        this.InnerStreamWrite(new Uint8Array(compressed), 0, compressedLength);

        if (this.readPosition >= this.bytes.byteLength) {
            this.canRead = false;
        }
    }

    makeBuffer(size: number) {
        try {
            return new Uint8Array(size);
        } catch (error) {
            var buf = new Array(size);

            for (var i = 0; i < size; i++) {
                buf[i] = 0;
            }

            return buf;
        }
    }


    WriteVarInt(value: number) {
        let bufferVal;
        while (true) {
            var b = (value & 0x7F);
            value >>= 7;
            bufferVal = (b | (value == 0 ? 0 : 0x80));
            this.currentOutput[this.writePosition] = bufferVal;
            this.writePosition++;
            // _innerStream.Write(buffer, 0, 1);
            if (value == 0) break;
        }
    }

    InnerStreamWrite(input: Uint8Array, offset: number, length: number) {
        memcpy(offset, this.writePosition, length, input, this.currentOutput);
        this.writePosition += length;
    }
}