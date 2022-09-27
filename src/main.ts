//import { createApp } from 'vue'
//import App from './App.vue'
import LZ4Stream from './LZ4Reader';
import { WorldData } from './proto/WorldData';
import TerrainMap from './rust/TerrainMap';
//var Buffer = require('buffer').Buffer
//var lz4 = require('lz4')
//var lz4 = require('./lz4.min.js')

//const { uncompress } = require('lz4-napi');
//var lz4 = require("lz4js");

//createApp(App).mount('#app');
//decode(new DataView(new ArrayBuffer(0)));

/*
(async () => {
    try {
        let test = await (await fetch("./procedural_3600_1714108817.map")).arrayBuffer();
        //let magicNumbers = new Uint8Array([0x04, 0x22, 0x4d, 0x18]);
        let testArray = new Array();
        let rawBytes = new Uint8Array(test).slice(4, test.byteLength);
        //decode(new Uint8Array(rawBytes));

        //let finalArray = new Uint8Array(magicNumbers.length + rawBytes.length);
        //finalArray.set(magicNumbers);
        //finalArray.set(rawBytes, magicNumbers.length);


        //console.log(lz4.decompress(lz4.compress(new Uint8Array([1, 2, 3, 4]))));
        //console.log(lz4);
        //console.log(lz4.decompressBlock(rawBytes, testArray, 0, rawBytes.length, 0));
        //let decompressedBytes = new Uint8Array(testArray);
        //testArray = new Array(); //clean up memory
        //let sample = decompressedBytes.slice(0, 512);
        //console.log(Array.from(sample).map(x => String.fromCharCode(x)));


        try {
            //console.log(testArray.length);
            //console.log(lz4.decompressFrame(rawBytes, testArray));        
            let stream = new LZ4Stream(rawBytes);
            let decoded = WorldData.decode(stream.getOutput());
            console.log(decoded);
            //console.log(decoded.maps[0].data);
            let terrainMap = new TerrainMap(decoded.maps[0].data, 1, "short");
        } catch (e) {
            console.error("error", e);
        }
        //var decompressed = lz4.decompress(test);
        //console.log(lz4.decode(test));
        //var output = lz4.decode(test)
        //const uncompressedBuffer = await uncompress(test)
    } catch (e) {
        // Deal with the fact the chain failed
    }
    // `text` is not available here
})();
*/

function decode(data: Uint8Array) {
    let dataview = new DataView(data.buffer);
    console.log(dataview);
    let ip = 0;
    let op = 0;
    let cpy = 0;
    const oend = dataview.byteLength;
    let output = new Uint8Array();

    let COPYLENGTH = 8;
    let ML_BITS = 4;
    let ML_MASK = (1 << ML_BITS) - 1;
    let RUN_BITS = 8 - ML_BITS;
    let RUN_MASK = (1 << RUN_BITS) - 1;
    let STEPSIZE = 8;

    let dec32table = [0, 3, 2, 3, 0, 0, 0, 0];

    console.log(ML_MASK, RUN_MASK);

    let token = dataview.getUint32(ip++);
    if ((length = (token >> ML_BITS)) == RUN_MASK) {
        let len;
        for (; (len = dataview.getUint32(ip++)) == 255; length += 255) {
        } length += len;
    }

    console.log(length, dataview.byteLength);

    if (cpy > oend - COPYLENGTH) {
        if (cpy != oend) output_error();         // Error : not enough place for another match (min 4) + 5 literals
        memcpy(op, ip, length, data, output);
        ip += length;
        //break;                                       // EOF
    }
    console.log(output);
    LZ4_WILDCOPY(ip, op, cpy); ip -= (op - cpy); op = cpy;

    let ref = dataview.getUint16(ip);
    console.log(ref);

    if ((length = (token & ML_MASK)) == ML_MASK) { for (; dataview.getUint32(ip) == 255; length += 255) { ip++; } length += dataview.getUint32(ip++); }
    console.log((op - ref) < STEPSIZE);
    /*
        if ((op - ref) < STEPSIZE) {
            let dec64 = 0;
            op[0] = ref[0];
            op[1] = ref[1];
            op[2] = ref[2];
            op[3] = ref[3];
            op += 4; ref += 4; ref -= dec32table[op - ref];
            A32(op) = A32(ref);
            op += STEPSIZE - 4; ref -= dec64;
        } else { LZ4_COPYSTEP(ref, op); }
        */
}

function LZ4_WILDCOPY(s: number, d: number, e: number) {
    console.log(s, d, e);
    do {
        LZ4_COPYPACKET(s, d);
    } while (d < e);
}

function LZ4_COPYPACKET(s: number, d: number) {
    //LZ4_COPYSTEP(s, d);
    //int32 at s = int32 at d

}

function output_error() {
    console.error("Error");
}

function memcpy(sourceIndex: number, destinationIndex: number, length: number, src: Uint8Array, dst: Uint8Array) {
    if (destinationIndex + src.byteLength > dst.byteLength) {
        let newDst = new Uint8Array(new ArrayBuffer(destinationIndex + src.byteLength));
        newDst.set(dst, 0);
        dst = newDst;
    }

    dst.set(src.slice(sourceIndex, sourceIndex + length), 0);
}

function TryReadVarInt() {

}