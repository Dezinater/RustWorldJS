const WORKERS_AMOUNT = 8;
import { BLOCK_SIZE } from "./LZ4Helper";

export default class LZ4Writer {
    bytes: ArrayBuffer;
    currentOutput: Uint8Array;
    readPosition: number;
    writePosition: number;
    canWrite: boolean;
    finalOutput: Uint8Array;
    writeChunks: Array<Uint8Array>;
    workersStarted: number;
    workersDone: number;
    workers: Array<Worker>;

    constructor(bytes: ArrayBuffer) {
        this.bytes = bytes;
        this.canWrite = true;
        this.readPosition = 0;
        this.writePosition = 0;
        this.writeChunks = new Array(0);
        this.currentOutput = new Uint8Array(new ArrayBuffer(this.bytes.byteLength));

        this.workersStarted = 0;
        this.workersDone = 0;
        this.workers = new Array(WORKERS_AMOUNT);
        for (let i = 0; i < WORKERS_AMOUNT; i++) {
            this.workers.push(new Worker(new URL('./worker.js', import.meta.url)));
        }
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
        this.writeChunks = new Array(0);
        return this.finalOutput;
    }

    getOutput() {
        return new Promise((resolve) => {
            if (!this.canWrite) {
                resolve(this.finalOutput);
                return;
            }

            let workersRequired = Math.ceil(this.bytes.byteLength / BLOCK_SIZE);

            this.workers.forEach(worker => {
                this.startWorker(worker);

                worker.onmessage = (e) => {
                    this.workersDone++;
                    let { index, bytes } = e.data;
                    this.writeChunks[index] = bytes;

                    if (this.workersDone >= workersRequired) {
                        if (this.canWrite) {
                            this.workersFinished();
                            this.canWrite = false;
                            resolve(this.finalOutput);
                        }
                    } else {
                        this.startWorker(worker);
                    }
                };
            });
        });
    }

    startWorker(worker: Worker) {
        let size = Math.min(this.bytes.byteLength - (this.workersStarted * BLOCK_SIZE), BLOCK_SIZE);
        worker.postMessage({
            index: this.workersStarted,
            bytes: this.bytes.slice(this.workersStarted * BLOCK_SIZE, (this.workersStarted * BLOCK_SIZE) + size) //since only the last one will be not block_size, i * BLOCK_SIZE is fine
        });
        this.workersStarted++;
    }

}