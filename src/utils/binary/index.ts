export class BinaryReader {
  private _view: DataView;
  private _buffer: ArrayBuffer;
  private _offset: number;
  private _littleEndian: boolean;
  private _utf8decoder: TextDecoder;

  public constructor(arrayBuffer: ArrayBuffer, littleEndian = true) {
    this._view = new DataView(arrayBuffer);
    this._buffer = arrayBuffer;
    this._offset = 0;
    this._littleEndian = littleEndian;
    this._utf8decoder = new TextDecoder("utf-8");
  }

  public get offset(): number {
    return this._offset;
  }

  public get buffer(): ArrayBuffer {
    return this._buffer;
  }

  public seek(offset: number): void {
    this._offset = offset;
  }

  public readNullTerminatedUTF8String() {
    const startOffset = this._offset;
    while (this._view.getUint8(this._offset++) !== 0) {}
    const utf8String = this._utf8decoder.decode(
      this._view.buffer.slice(startOffset, this._offset - 1)
    );
    return utf8String;
  }

  public readUTF8StringWithLength() {
    const stringLength = this.readUint32();
    const utf8String = this._utf8decoder.decode(
      this._view.buffer.slice(this._offset, this._offset + stringLength)
    );
    this._offset += stringLength;
    return utf8String;
  }

  public readUint8() {
    const value = this._view.getUint8(this._offset);
    this._offset++;
    return value;
  }

  public readUint16() {
    const value = this._view.getUint16(this._offset, this._littleEndian);
    this._offset += 2;
    return value;
  }

  public readInt32() {
    const value = this._view.getInt32(this._offset, this._littleEndian);
    this._offset += 4;
    return value;
  }

  public readUint32() {
    const value = this._view.getUint32(this._offset, this._littleEndian);
    this._offset += 4;
    return value;
  }

  public readFloat() {
    const value = this._view.getFloat32(this._offset, this._littleEndian);
    this._offset += 4;
    return value;
  }

  public readULEB128() {
    let result = 0;
    let shift = 0;
    let byte;

    do {
      byte = this.readUint8();
      result |= (byte & 0x7f) << shift;
      shift += 7;
    } while (byte & 0x80);

    return result;
  }

  public readUint8Array(length: number): Uint8Array {
    const slice = this.readSlice(this.offset, length);
    this._offset += length;
    return new Uint8Array(slice);
  }

  public readSlice(offset: number, length: number) {
    return this._view.buffer.slice(offset, offset + length);
  }
}

export class BinaryWriter {
  private _view: DataView;
  private _offset: number;
  private _littleEndian: boolean;

  constructor(buffer: ArrayBuffer, littleEndian = true) {
    this._view = new DataView(buffer);
    this._offset = 0;
    this._littleEndian = littleEndian;
  }

  public seek(offset: number): void {
    if (offset >= 0 && offset < this._view.byteLength) {
      this._offset = offset;
    } else {
      throw new Error("Invalid offset value.");
    }
  }

  public writeUint8(value: number): void {
    if (this._offset < this._view.byteLength) {
      this._view.setUint8(this._offset, value);
      this._offset += 1;
    } else {
      throw new Error(
        "Buffer overflow: Cannot write beyond the ArrayBuffer length."
      );
    }
  }

  public writeInt32(value: number): void {
    if (this._offset < this._view.byteLength) {
      this._view.setInt32(this._offset, value, this._littleEndian);
      this._offset += 4;
    } else {
      throw new Error(
        "Buffer overflow: Cannot write beyond the ArrayBuffer length."
      );
    }
  }

  public writeUint32(value: number): void {
    if (this._offset < this._view.byteLength) {
      this._view.setUint32(this._offset, value, this._littleEndian);
      this._offset += 4;
    } else {
      throw new Error(
        "Buffer overflow: Cannot write beyond the ArrayBuffer length."
      );
    }
  }

  public writeFloat(value: number): void {
    if (this._offset < this._view.byteLength) {
      this._view.setFloat32(this._offset, value, this._littleEndian);
      this._offset += 4;
    } else {
      throw new Error(
        "Buffer overflow: Cannot write beyond the ArrayBuffer length."
      );
    }
  }

  public writeBytes(bytes: number[] | Uint8Array): void {
    const bytesToWrite = new Uint8Array(bytes);
    const remainingSpace = this._view.byteLength - this._offset;
    const bytesToWriteLength = bytesToWrite.length;

    if (bytesToWriteLength <= remainingSpace) {
      for (let i = 0; i < bytesToWriteLength; i++) {
        this._view.setUint8(this._offset, bytesToWrite[i]);
        this._offset++;
      }
    } else {
      throw new Error(
        "Buffer overflow: Cannot write beyond the ArrayBuffer length."
      );
    }
  }

  public finalize(): Uint8Array {
    return new Uint8Array(this._view.buffer);
  }
}
