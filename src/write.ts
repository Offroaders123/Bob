import type { BOBArray, BOBObject, BOBPrimitive } from "./primitive.js";

export class BOBWriter {
  #byteOffset: number = 0;
  #data: Uint8Array = new Uint8Array(1024);
  #view: DataView = new DataView(this.#data.buffer);
  readonly #encoder: TextEncoder = new TextEncoder();

  #allocate(byteLength: number): void {
    const required: number = this.#byteOffset + byteLength;
    if (this.#data.byteLength > required) return;
    let length: number = this.#data.byteLength;
    while (length < required) {
      length *= 2;
    }
    const data: Uint8Array = new Uint8Array(length);
    data.set(this.#data, 0);
    this.#data = data;
    this.#view = new DataView(this.#data.buffer);
  }

  primitive(value: BOBPrimitive): this {
    return this;
  }

  string(value: string): this {
    return this;
  }

  number(value: number): this {
    return this;
  }

  boolean(value: boolean): this {
    return this;
  }

  null(value: null): this {
    return this;
  }

  array(value: BOBArray<BOBPrimitive>): this {
    return this;
  }

  object(value: BOBObject): this {
    return this;
  }
}