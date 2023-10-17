import Worker from 'web-worker';
import { BLOCK_SIZE } from "./LZ4Helper.js";

const WORKERS_AMOUNT = 8;

export default class LZ4Writer {
    /** @type {ArrayBuffer} */
    bytes;
    /** @type {Uint8Array} */
    currentOutput;
    /** @type {number} */
    readPosition;
    /** @type {number} */
    writePosition;
    /** @type {boolean} */
    canWrite;
    /** @type {Uint8Array} */
    finalOutput;
    /** @type {Array<Uint8Array>} */
    writeChunks;
    /** @type {number} */
    workersStarted;
    /** @type {number} */
    workersDone;
    /** @type {Array<Worker>} */
    workers;

    /**
     * @param {ArrayBuffer} bytes 
     */
    constructor(bytes) {
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
            this.workers[i] = new Worker(new URL('./worker.js', import.meta.url));
        }
    }

    workersFinished() {
        let size = this.writeChunks.map(x => x.length).reduce((lastVal, currVal) => lastVal + currVal, 0);
        let flatOutput = new Uint8Array(new ArrayBuffer(size));

        let finalWritePos = 0;
        this.writeChunks.forEach((chunk, i) => {
            flatOutput.set(chunk, finalWritePos);
            finalWritePos += chunk.length;
        });

        let finalMap = new Uint8Array(flatOutput.length + 4);
        finalMap[0] = 9;
        finalMap.set(flatOutput, 4);

        this.finalOutput = finalMap;
        this.writeChunks = new Array(0);

        this.workers.forEach(worker => worker.terminate());

        return this.finalOutput;
    }

    getOutput() {
        return new Promise((resolve) => {
            if (!this.canWrite) {
                resolve(this.finalOutput);
                return;
            }

            let workersRequired = Math.ceil(this.bytes.byteLength / BLOCK_SIZE)
            this.workers.forEach(worker => {
                this.startWorker(worker);

                worker.addEventListener('message', e => {
                    this.workersDone++;
                    let { index, bytes } = e.data;
                    this.writeChunks[index] = bytes;
 
                    if (this.workersDone >= workersRequired) {
                        if (this.canWrite) {
                            this.workersFinished();
                            this.canWrite = false;
                            resolve(this.finalOutput);
                        }
                    } else if (this.workersStarted < workersRequired) {
                        this.startWorker(worker);
                    }
                });
            });
        });
    }

    /**
     * @param {Worker} worker 
     */
    startWorker(worker) {
        let size = Math.min(this.bytes.byteLength - (this.workersStarted * BLOCK_SIZE), BLOCK_SIZE);
        worker.postMessage({
            index: this.workersStarted,
            bytes: this.bytes.slice(this.workersStarted * BLOCK_SIZE, (this.workersStarted * BLOCK_SIZE) + size) //since only the last one will be not block_size, i * BLOCK_SIZE is fine
        });
        this.workersStarted++;
    }

}