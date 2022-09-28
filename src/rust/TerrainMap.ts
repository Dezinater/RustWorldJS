export default class TerrainMap {
    type: string;
    res: number;
    dst: Uint8Array | Uint16Array | Uint32Array;
    channels: number;

    constructor(data: Uint8Array, channels: number, type: string | "int" | "short" | "byte") {
        this.channels = channels;
        switch (type) {
            case "int": this.dst = new Uint32Array(data.buffer, data.byteOffset, data.byteLength / Uint32Array.BYTES_PER_ELEMENT); break;
            case "short": this.dst = new Uint16Array(data.buffer, data.byteOffset, data.byteLength / Uint16Array.BYTES_PER_ELEMENT); break;
            case "byte": this.dst = new Uint8Array(data.buffer, data.byteOffset, data.byteLength / Uint8Array.BYTES_PER_ELEMENT); break;
        }
        this.type = type;
        let byteSize = this.BytesPerElement();
        this.res = Math.ceil(Math.sqrt(data.length / byteSize / channels));
    }

    get(x = 0, y = 0, channel = 0) {
        return this.dst[(x + (this.res - y) * this.res) + (channel * this.res * this.res)];
    }

    set(value: number, x = 0, y = 0, channel = 0) {
        this.dst[(x + (this.res - y) * this.res) + (channel * this.res * this.res)] = value;
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