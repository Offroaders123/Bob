import { deepStrictEqual } from "node:assert";
import type { Replacer, Reviver } from "./JSON-replacer-reviver.js";

interface Demo {
  demo: Demo;
  nice: number;
  hey: number;
  what: string;
  aaa: number[];
  gg: {
    aaa: Demo["aaa"];
    demo: Demo;
  };
}

const demo: Demo = {
  demo: {} as Demo,
  nice: 5,
  hey: 2,
  what: "hey",
  aaa: [3, 2, 1],
  gg: {
    aaa: {} as Demo["aaa"],
    demo: {} as Demo
  }
};

demo.demo = demo;
demo.gg.aaa = demo.aaa;
demo.gg.demo = demo;

console.log(demo);

interface Ref {
  $ref: number;
}

const replacer = (): Replacer => {
  const seen = new WeakMap<object, number>();
  let idCounter = 0;

  return function (key, value) {
    if (typeof value === "object" && value !== null) {
      if (seen.has(value)) {
        // Circular reference detected
        return { $ref: seen.get(value) };
      } else {
        // Assign a unique ID to the object
        const id = idCounter++;
        seen.set(value, id);
        (value as any).$id = id; // Add a unique identifier for reference
      }
    }
    return value;
  };
}

const reviver = (): Reviver => {
  const idMap = new Map<number, any>();

  return function (key, value) {
    if (value && typeof value === "object") {
      if ("$id" in value) {
        // Store objects with IDs
        idMap.set(value.$id, value);
      }
      if ("$ref" in value) {
        // Replace references with actual objects
        return idMap.get(value.$ref);
      }
    }
    return value;
  };
}

const globb = JSON.stringify(demo, replacer());
console.log(globb);

const globbed: typeof demo = JSON.parse(globb, reviver());
console.log(globbed);

// deepStrictEqual(demo, globbed);