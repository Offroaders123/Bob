import { write } from "../src/write.js";
import data from "../package.json" with { type: "json" };

console.log(data);

const binary: Uint8Array = write(data);
console.log(binary);