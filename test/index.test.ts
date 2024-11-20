import { describe, it } from "node:test";
import { deepStrictEqual } from "node:assert";
import { writeFile } from "node:fs/promises";
import { read, write } from "../src/index.js";
import data from "../package.json" with { type: "json" };

describe("Read-Write", () => {
  it("package.json", () => {
    // console.log(data);

    const binary: Uint8Array = write(data);
    // console.log(Buffer.from(binary.buffer));

    writeFile(new URL("./package.bob", import.meta.url), binary);

    const redata: typeof data = read(binary);
    // console.log(redata);

    deepStrictEqual(data, redata);
  });
});