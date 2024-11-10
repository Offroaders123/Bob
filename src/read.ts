import { getTag, TAG } from "./primitive.js";

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

  #tag(): TAG {}

  #byte(): number {}

  primitive(): BOBPrimitive {}

  string(): string {}

  number(): number {}

  boolean(): boolean {}

  null(): null {}

  array(): BOBArray<BOBPrimitive | undefined> {}

  object(): BOBObject {}
}