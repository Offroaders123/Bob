import { getTag, TAG } from "./primitive.js";

import type { BOBArray, BOBObject, BOBPrimitive } from "./primitive.js";

export function write(value: BOBPrimitive): Uint8Array {
  const writer: BOBWriter = new BOBWriter();
  return writer.primitive(value).seal();
}

export class BOBWriter {
  #byteOffset: number = 0;
  #data: Uint8Array = new Uint8Array(1024);
  #view: DataView = new DataView(this.#data.buffer);
  readonly #encoder: TextEncoder = new TextEncoder();

  seal(): Uint8Array {
    return this.#data.slice(0, this.#byteOffset);
  }

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

  #tag(value: TAG): this {
    this.#allocate(1);
    this.#view.setUint8(this.#byteOffset, value);
    this.#byteOffset += 1;
    return this;
  }

  primitive(value: BOBPrimitive): this {
    switch (true) {
      case typeof value === "string": return this.string(value);
      case typeof value === "number": return this.number(value);
      case typeof value === "boolean": return this.boolean(value);
      case value === null: return this.null();
      case Array.isArray(value): return this.array(value);
      case typeof value === "object": return this.object(value);
      default: throw new TypeError(`Unexpected value type '${typeof value}' for value '${value}'`);
    }
  }

  string(value: string): this {
    this.#tag(TAG.STRING);
    const entry: Uint8Array = this.#encoder.encode(value);
    const { length } = entry;
    this.#allocate(length);
    this.#data.set(entry, this.#byteOffset);
    this.#byteOffset += length;
    return this;
  }

  number(value: number): this {
    this.#tag(TAG.NUMBER);
    this.#allocate(8);
    this.#view.setFloat64(this.#byteOffset, value, true);
    this.#byteOffset += 8;
    return this;
  }

  boolean(value: boolean): this {
    this.#tag(TAG.BOOLEAN);
    this.#allocate(1);
    this.#view.setUint8(this.#byteOffset, Number(value));
    return this;
  }

  null(): this {
    this.#tag(TAG.NULL);
    return this;
  }

  array(value: BOBArray<BOBPrimitive | undefined>): this {
    this.#tag(TAG.ARRAY);
    for (const entry of value) {
      if (entry === undefined) {
        this.null();
        continue;
      }
      const type: TAG | null = getTag(entry as unknown);
      if (type === null) continue;
      this.primitive(entry);
    }
    this.#tag(TAG.END);
    return this;
  }

  object(value: BOBObject): this {
    this.#tag(TAG.OBJECT);
    for (const [name, entry] of Object.entries(value)) {
      if (entry === undefined) {
        this.null();
        continue;
      }
      const type: TAG | null = getTag(entry as unknown);
      if (type === null) continue;
      this.string(name);
      this.primitive(entry);
    }
    return this;
  }
}