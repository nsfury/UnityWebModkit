export declare class BinaryReader {
    private _view;
    private _buffer;
    private _offset;
    private _littleEndian;
    private _utf8decoder;
    constructor(arrayBuffer: ArrayBuffer, littleEndian?: boolean);
    get offset(): number;
    get buffer(): ArrayBuffer;
    seek(offset: number): void;
    readNullTerminatedUTF8String(): string;
    readUTF8StringWithLength(): string;
    readUint8(): number;
    readUint16(): number;
    readInt32(): number;
    readUint32(): number;
    readFloat(): number;
    readULEB128(): number;
    readUint8Array(length: number): Uint8Array;
    readSlice(offset: number, length: number): ArrayBuffer;
}
export declare class BinaryWriter {
    private _view;
    private _offset;
    private _littleEndian;
    constructor(buffer: ArrayBuffer, littleEndian?: boolean);
    seek(offset: number): void;
    writeUint8(value: number): void;
    writeInt32(value: number): void;
    writeUint32(value: number): void;
    writeFloat(value: number): void;
    writeBytes(bytes: number[] | Uint8Array): void;
    finalize(): Uint8Array;
}
//# sourceMappingURL=index.d.ts.map