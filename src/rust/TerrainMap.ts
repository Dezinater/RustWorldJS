export default class TerrainMap {
    type: string;
    res: number;
    dst: Uint8Array | Uint16Array | Uint32Array;
    channels: number;
    worldSize: number;

    constructor(data: Uint8Array, channels: number, type: string | "int" | "short" | "byte", worldSize: number) {
        this.channels = channels;
        this.worldSize = worldSize;
        let offset = data.byteOffset;

        //not sure why the data isnt aligned but aligning it like this fixes it
        if (type == "int" && offset % 4 != 0) {
            offset += 4 - (offset % 4);
        }
        if (type == "short" && offset % 2 != 0) {
            offset++;
        }

        switch (type) {
            case "int": this.dst = new Uint32Array(data.buffer, offset, data.byteLength / Uint32Array.BYTES_PER_ELEMENT); break;
            case "short": this.dst = new Uint16Array(data.buffer, offset, data.byteLength / Uint16Array.BYTES_PER_ELEMENT); break;
            case "byte": this.dst = new Uint8Array(data.buffer, offset, data.byteLength / Uint8Array.BYTES_PER_ELEMENT); break;
        }
        
        this.type = type;
        let byteSize = this.BytesPerElement();
        this.res = Math.ceil(Math.sqrt(data.length / byteSize / channels));
    }

    getDst() {
        return new Uint8Array(this.dst.buffer, this.dst.byteOffset, this.dst.byteLength);
    }

    convertCoords(x, y) {
        return {
            x: Math.ceil((x / this.worldSize) * this.res),
            y: Math.ceil((y / this.worldSize) * this.res),
        };
    }

    get(mapX = 0, mapY = 0, channel = 0) {
        let { x, y } = this.convertCoords(mapX, mapY);
        return this.dst[(x + (this.res - y - 1) * this.res) + (channel * this.res * this.res)];
    }

    set(value: number, mapX = 0, mapY = 0, channel = 0) {
        let { x, y } = this.convertCoords(mapX, mapY);
        this.dst[(x + (this.res - y - 1) * this.res) + (channel * this.res * this.res)] = value;
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
        return this.dst.slice(channel * this.res * this.res, (channel + 1) * this.res * this.res)
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