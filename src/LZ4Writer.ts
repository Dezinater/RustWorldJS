let lz4 = require("./lz4/lz4.js");
//import { Worker } from 'worker_threads';

//new Worker(new URL('./worker.js'));
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
    canWrite: boolean;
    finalOutput: Uint8Array;
    writeChunks: Array<Uint8Array>;

    constructor(bytes: ArrayBuffer) {
        this.writeChunks = new Array(0);
        this.readPosition = 0;
        this.writePosition = 0;
        this.canWrite = true;
        this.bytes = bytes;
        this.currentOutput = new Uint8Array(new ArrayBuffer(this.bytes.byteLength));
    }

    workersFinished() {
        let size = this.writeChunks.map(x => x.length).reduce((lastVal, currVal) => lastVal + currVal, 0);
        let flatOutput = new Uint8Array(new ArrayBuffer(size));

        let finalWritePos = 0;
        this.writeChunks.forEach((chunk) => {
            flatOutput.set(chunk, finalWritePos);
            finalWritePos += chunk.length;
        });

        let finalMap = new Uint8Array(flatOutput.length + 4);
        finalMap[0] = 9;
        finalMap.set(flatOutput, 4);

        this.finalOutput = finalMap;
        return this.finalOutput;
    }

    getOutput() {
        return new Promise((resolve, reject) => {
            if (!this.canWrite) {
                resolve(this.finalOutput);
                return;
            }

            let workersDone = 0;
            let workersRequired = Math.ceil(this.bytes.byteLength / BLOCK_SIZE);
            for (let i = 0; i < workersRequired; i++) {
                let worker = new Worker(new URL('./worker.js', import.meta.url));

                let size = Math.min(this.bytes.byteLength - (i * BLOCK_SIZE), BLOCK_SIZE);
                worker.postMessage({
                    index: i,
                    bytes: this.bytes.slice(i * BLOCK_SIZE, (i * BLOCK_SIZE) + size) //since only the last one will be not block_size, i * BLOCK_SIZE is fine
                });

                worker.onmessage = (e) => {
                    workersDone++;
                    let { index, bytes } = e.data;
                    this.writeChunks[index] = bytes;

                    if (workersDone == workersRequired) {
                        this.workersFinished();
                        this.canWrite = false;
                        resolve(this.finalOutput);
                    }
                };
            }
        });
        /*
                while (this.canRead) {
                    this.FlushCurrentChunk();
                    console.log("Flushed " + this.readPosition + " " + this.writePosition + " " + this.bytes.byteLength);
                }
        
                let finalMap = new Uint8Array(this.writePosition + 4);
                finalMap[0] = 9;
                finalMap.set(this.currentOutput.slice(0, this.writePosition), 4);
        
                this.currentOutput = finalMap;
                return this.currentOutput;
                */
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
            this.canWrite = false;
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