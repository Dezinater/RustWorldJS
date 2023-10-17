export const BLOCK_SIZE = 1024 * 1024;

/**
 * @enum {number}
 */
export const ChunkFlags = {
    /** * @type {number} */
    None: 0x00,
    /** * @type {number} */
    Compressed: 0x01,
    /** * @type {number} */
    HighCompression: 0x02,
    /** * @type {number} */
    Passes: 0x04 | 0x08 | 0x10,
};

/**
 * 
 * @param {number} sourceIndex 
 * @param {number} destinationIndex 
 * @param {number} length 
 * @param {Uint8Array} src 
 * @param {Uint8Array} dst 
 * @returns 
 */
export function memcpy(sourceIndex, destinationIndex, length, src, dst) {
    if (destinationIndex + length > dst.byteLength) {
        const newDst = new Uint8Array(new ArrayBuffer(destinationIndex + src.byteLength));
        newDst.set(dst, 0);
        dst = newDst;
    }
    dst.set(src.slice(sourceIndex, sourceIndex + length), destinationIndex);

    return dst;
}