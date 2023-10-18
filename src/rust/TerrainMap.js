export default class TerrainMap {
    /** @type {"int" | "short" | "byte"} */
    type;
    /** @type {number} */
    res;
    /** @type {number} */
    channels;
    /** @type {number} */
    worldSize;
    /** @type {Array<Uint8Array | Uint16Array | Uint32Array>} */
    data;

    /**
     * 
     * @param {Uint8Array} data 
     * @param {number} channels 
     * @param {"int" | "short" | "byte"} type 
     * @param {number} worldSize 
     */
    constructor(data, channels, type, worldSize) {
        this.channels = channels;
        this.worldSize = worldSize;
        let offset = data.byteOffset;
        /** @type {Uint8Array | Uint16Array | Uint32Array} */
        let dst;

        //not sure why the data isnt aligned but aligning it like this fixes it
        if (type == "int" && offset % 4 != 0) {
            offset += 4 - (offset % 4);
        }
        if (type == "short" && offset % 2 != 0) {
            offset++;
        }

        switch (type) {
            case "int": dst = new Uint32Array(data.buffer, offset, data.byteLength / Uint32Array.BYTES_PER_ELEMENT); break;
            case "short": dst = new Uint16Array(data.buffer, offset, data.byteLength / Uint16Array.BYTES_PER_ELEMENT); break;
            case "byte": dst = new Uint8Array(data.buffer, offset, data.byteLength / Uint8Array.BYTES_PER_ELEMENT); break;
        }

        this.data = new Array();
        let sliceSize = dst.length / channels;
        this.res = Math.sqrt(dst.length / channels);

        for (let i = 0; i <= channels - 1; i++) {
            let slice = dst.slice(i * sliceSize, (i + 1) * sliceSize);
            let resizedSlice = this.resize(slice, this.res, this.res, worldSize, worldSize);
            this.data.push(resizedSlice);
        }

        this.type = type;
    }

    /**
     * @param {*} pixels 
     * @param {number} w1 
     * @param {number} h1 
     * @param {number} w2 
     * @param {number} h2 
     * @returns {*}
     */
    resize(pixels, w1, h1, w2, h2) { //nearest neighbour
        let temp = new pixels.constructor(Array(w2 * h2));
        let x_ratio = w1 / w2;
        let y_ratio = h1 / h2;
        let px, py;
        for (let i = 0; i < h2; i++) {
            for (let j = 0; j < w2; j++) {
                px = Math.floor(j * x_ratio);
                py = Math.floor(i * y_ratio);
                temp[(i * w2) + j] = pixels[(py * w1) + px];
            }
        }
        return temp;
    }

    getDst() {
        let resizedData = this.data.map(x => this.resize(x, this.worldSize, this.worldSize, this.res, this.res));
        let size = resizedData[0].byteLength; //all of them should be the same length

        let finalArray = new resizedData[0].constructor(new ArrayBuffer(size * resizedData.length));
        resizedData.forEach((data, i) => {
            finalArray.set(data, i * size);
        });

        let returnArray = new Uint8Array(finalArray.buffer, finalArray.byteOffset, finalArray.byteLength);
        return returnArray;
    }

    get(x = 0, y = 0, channel = 0) {
        console.log(x, y, (x * this.worldSize) + y);
        return this.data[channel][(x * this.worldSize) + y];
    }

    /**
     * @param {number} value 
     * @param {number} x 
     * @param {number} y 
     * @param {number} channel 
     */
    set(value, x = 0, y = 0, channel = 0) {
        this.data[channel][(x * this.worldSize) + y] = value;
    }

    getNormalized(x = 0, y = 0, channel = 0) {
        let maxValue = 2 ** (this.BytesPerElement() * 8) - 1;
        return this.get(x, y, channel) / maxValue;
    }

    /**
     * @param {number} value 
     * @param {number} x 
     * @param {number} y 
     * @param {number} channel 
     */
    setNormalized(value, x = 0, y = 0, channel = 0) {
        let maxValue = 2 ** (this.BytesPerElement() * 8) - 1;
        this.set(Math.min(1, value) * maxValue, x, y, channel);
    }

    /**
     * @param {number} channel 
     * @returns 
     */
    getChannel(channel) {
        return this.data[channel];
    }

    channelsAmount() {
        return this.channels;
    }

    BytesPerElement() {
        switch (this.type) {
            case "int": return 4;
            case "short": return 2;
            case "byte": return 1;
        }
        return 1;
    }
}