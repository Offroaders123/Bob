import { describe, it } from "node:test";
import { deepStrictEqual } from "node:assert";
import { writeFile } from "node:fs/promises";
import { read, write } from "../src/index.js";

import type { BOBPrimitive } from "../src/index.js";

import pakcage from "../package.json" with { type: "json" };
import all from "./all.json" with { type: "json" };

const tests = [
  ["./package.bob", pakcage, true],
  ["./all.json", all]
] as const satisfies [string, BOBPrimitive, true?][];

describe("Read-Write", () => {
  for (const [name, data, shouldWrite] of tests) {
    it(name, () => readWriteTest(name, data, shouldWrite));
  }
});

function readWriteTest<T extends BOBPrimitive>(name: string, data: T, shouldWrite: boolean = false): void {
  // console.log(data);

  const binary: Uint8Array = write(data);
  // console.log(Buffer.from(binary.buffer));

  if (shouldWrite) writeFile(new URL(name, import.meta.url), binary);

  const redata: T = read(binary);
  // console.log(redata);

  deepStrictEqual(data, redata);
}