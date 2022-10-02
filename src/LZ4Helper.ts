export const BLOCK_SIZE = 1024 * 1024;

export enum ChunkFlags {
    None = 0x00,
    Compressed = 0x01,
    HighCompression = 0x02,
    Passes = 0x04 | 0x08 | 0x10,
}

export function memcpy(sourceIndex: number, destinationIndex: number, length: number, src: Uint8Array, dst: Uint8Array) {
    if (destinationIndex + length > dst.byteLength) {
        const newDst = new Uint8Array(new ArrayBuffer(destinationIndex + src.byteLength));
        newDst.set(dst, 0);
        dst = newDst;
    }
    dst.set(src.slice(sourceIndex, sourceIndex + length), destinationIndex);

    return dst;
}