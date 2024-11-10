import { isTag, TAG } from "./primitive.js";

import type { BOBArray, BOBObject, BOBPrimitive } from "./primitive.js";

export function read(data: Uint8Array): BOBPrimitive {
  const reader: BOBReader = new BOBReader(data);
  return reader.primitive();
}

export class BOBReader {
  #byteOffset: number = 0;
  #data: Uint8Array;
  #view: DataView;
  readonly #decoder: TextDecoder = new TextDecoder();

  constructor(data: Uint8Array) {
    this.#data = data;
    this.#view = new DataView(this.#data.buffer, this.#data.byteOffset, this.#data.byteLength);
  }

  #allocate(byteLength: number): void {
    if (this.#byteOffset + byteLength > this.#data.byteLength) {
      throw new Error("Ran out of bytes to read, unexpectedly reached the end of the buffer");
    }
  }

  #tag<T extends TAG>(tag: T): T;
  #tag(): TAG;
  #tag(tag?: TAG): TAG {
    this.#allocate(1);
    const type: number = this.#view.getUint8(this.#byteOffset);
    this.#byteOffset += 1;
    if (!isTag(type)) {
      throw new Error(`Encountered unsupported tag type '${type}' at byte offset ${this.#byteOffset}`);
    }
    if (tag !== undefined && type !== tag) {
      throw new Error(`Encountered unexpected tag type '${type}' at byte offset ${this.#byteOffset}, expected 'TAG.${TAG[tag]}'`);
    }
    return type;
  }

  #byte(): number {
    this.#allocate(1);
    const value: number = this.#view.getInt8(this.#byteOffset);
    this.#byteOffset += 1;
    return value;
  }

  primitive(): BOBPrimitive {
    const type: TAG = this.#tag();
    this.#byteOffset -= 1;
    switch (type) {
      case TAG.END: throw new Error(`Encountered unexpected 'TAG.${TAG[TAG.END]}' at byte offset ${this.#byteOffset}`);
      case TAG.STRING: return this.string();
      case TAG.NUMBER: return this.number();
      case TAG.BOOLEAN: return this.boolean();
      case TAG.NULL: return this.null();
      case TAG.ARRAY: return this.array();
      case TAG.OBJECT: return this.object();
    }
  }

  string(): string {
    this.#tag(TAG.STRING);
    const length: number = this.number();
    this.#allocate(length);
    const value: string = this.#decoder.decode(this.#data.subarray(this.#byteOffset, this.#byteOffset + length));
    this.#byteOffset += length;
    return value;
  }

  number(): number {
    this.#tag(TAG.NUMBER);
    let result: number = 0;
    let shift: number = 0;
    while (true) {
      this.#allocate(1);
      const byte: number = this.#byte();
      result |= ((byte & 0x7F) << shift);
      if (!(byte & 0x80)) break;
      shift += 7;
      if (shift > 63) {
        throw new Error(`VarInt size '${shift}' at byte offset ${this.#byteOffset} is too large`);
      }
    }
    const zigzag: number = ((((result << 63) >> 63) ^ result) >> 1) ^ (result & (1 << 63));
    return zigzag;
  }

  boolean(): boolean {
    this.#tag(TAG.BOOLEAN);
    this.#allocate(1);
    const value: boolean = Boolean(this.#view.getUint8(this.#byteOffset));
    return value;
  }

  null(): null {
    this.#tag(TAG.NULL);
    return null;
  }

  array(): BOBArray<BOBPrimitive> {
    this.#tag(TAG.ARRAY);
    const value: BOBArray<BOBPrimitive> = [];
    while (true) {
      const type: TAG = this.#tag();
      this.#byteOffset -= 1;
      if (type === TAG.END) break;
      const entry: BOBPrimitive = this.primitive();
      value.push(entry);
    }
    return value;
  }

  object(): BOBObject {
    this.#tag(TAG.OBJECT);
    const value: BOBObject = {};
    while (true) {
      const type: TAG = this.#tag();
      this.#byteOffset -= 1;
      if (type === TAG.END) break;
      const name: string = this.string();
      const entry: BOBPrimitive = this.primitive();
      value[name] = entry;
    }
    return value;
  }
}