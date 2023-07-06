export default class TerrainMap {
    type: string;
    res: number;
    channels: number;
    worldSize: number;
    data: Array<Uint8Array | Uint16Array | Uint32Array>;

    constructor(data: Uint8Array, channels: number, type: string | "int" | "short" | "byte", worldSize: number) {
        this.channels = channels;
        this.worldSize = worldSize;
        let offset = data.byteOffset;
        let dst: Uint8Array | Uint16Array | Uint32Array;

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

    resize(inputArray, inputWidth, inputHeight, newWidth, newHeight) {
        const scaleX = inputWidth / newWidth;
        const scaleY = inputHeight / newHeight;

        let outputArray = new inputArray.constructor(Array(newWidth * newHeight));

        let interpolate = (c00, c10, c01, c11, weightX, weightY) => {
            const interpolatedValue = (1 - weightX) * (1 - weightY) * c00 +
                weightX * (1 - weightY) * c10 +
                (1 - weightX) * weightY * c01 +
                weightX * weightY * c11;

            return interpolatedValue;
        };

        for (let y = 0; y < newHeight; y++) {
            for (let x = 0; x < newWidth; x++) {
                const srcX = x * scaleX;
                const srcY = y * scaleY;

                const x1 = Math.floor(srcX);
                const y1 = Math.floor(srcY);
                const x2 = Math.ceil(srcX);
                const y2 = Math.ceil(srcY);

                const weightX = srcX - x1;
                const weightY = srcY - y1;

                const indexTL = y1 * inputWidth + x1;
                const indexTR = y1 * inputWidth + x2;
                const indexBL = y2 * inputWidth + x1;
                const indexBR = y2 * inputWidth + x2;

                const topLeft = inputArray[indexTL];
                const topRight = inputArray[indexTR];
                const bottomLeft = inputArray[indexBL];
                const bottomRight = inputArray[indexBR];

                const interpolatedValue = interpolate(topLeft, topRight, bottomLeft, bottomRight, weightX, weightY);
                const outputIndex = y * newWidth + x;
                outputArray[outputIndex] = interpolatedValue;
            }
        }

        return outputArray;
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

    set(value: number, x = 0, y = 0, channel = 0) {
        this.data[channel][(x * this.worldSize) + y] = value;
    }

    getNormalized(x = 0, y = 0, channel = 0) {
        let maxValue = 2 ** (this.BytesPerElement() * 8) - 1;
        return this.get(x, y, channel) / maxValue;
    }

    setNormalized(value: number, x = 0, y = 0, channel = 0) {
        let maxValue = 2 ** (this.BytesPerElement() * 8) - 1;
        this.set(Math.min(1, value) * maxValue, x, y, channel);
    }

    getChannel(channel: number) {
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