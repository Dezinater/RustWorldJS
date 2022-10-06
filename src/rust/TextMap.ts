export default class TextMap {
    dst: string;

    constructor(data: Uint8Array) {
        //map each byte value to a character code then combine the array into a string
        this.dst = Array.from(data).map(x => String.fromCharCode(x)).join("");
    }

    getDst() {
        return new Uint8Array(this.dst.split("").map(x => x.charCodeAt(0)));
    }

}