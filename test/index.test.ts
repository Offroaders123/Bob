import { writeFile } from "node:fs/promises";
import { deepStrictEqual } from "node:assert";
import { read, write } from "../src/index.js";
import data from "../package.json" with { type: "json" };

console.log(data);

const binary: Uint8Array = write(data);
console.log(Buffer.from(binary.buffer));

await writeFile(new URL("./package.bob", import.meta.url), binary);

const redata: typeof data = read(binary);
console.log(redata);

deepStrictEqual(data, redata);