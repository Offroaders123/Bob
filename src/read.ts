import { getTag, isTag, TAG } from "./primitive.js";

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

  #tag(): TAG {
    this.#allocate(1);
    const type: number = this.#view.getUint8(this.#byteOffset);
    this.#byteOffset += 1;
    if (!isTag(type)) {
      throw new Error(`Encountered unsupported tag type '${type}' at byte offset ${this.#byteOffset}`);
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
      case TAG.STRING: return this.string();
      case TAG.NUMBER: return this.number();
      case TAG.BOOLEAN: return this.boolean();
      case TAG.NULL: return this.null();
      case TAG.ARRAY: return this.array();
      case TAG.OBJECT: return this.object();
      default: throw new Error(`Encountered unsupported tag type '${type}' at byte offset ${this.#byteOffset + 1}`);
    }
  }

  string(): string {
    const type: TAG = this.#tag();
    if (type !== TAG.STRING) {
      throw new Error(`Expected string tag, found '${TAG[type]}'`);
    }
    const entry: string = this.#decoder.decode(this.#data.subarray(this.#byteOffset, this.#byteOffset + length));
  }

  number(): number {}

  boolean(): boolean {}

  null(): null {}

  array(): BOBArray<BOBPrimitive> {}

  object(): BOBObject {}
}