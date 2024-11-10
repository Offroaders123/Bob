import { writeFile } from "node:fs/promises";
import { read, write } from "../src/index.js";
import data from "../package.json" with { type: "json" };

import type { BOBPrimitive } from "../src/index.js";

console.log(data);

const binary: Uint8Array = write(data);
console.log(Buffer.from(binary.buffer));

const redata: BOBPrimitive = read(binary);
console.log(redata);

await writeFile(new URL("./package.bob", import.meta.url), binary);