import { deepStrictEqual } from "node:assert";
import type { Replacer, Reviver } from "./JSON-replacer-reviver.js";

interface Demo {
  demo: Demo;
  nice: number;
  hey: number;
  what: string;
  aaa: number[];
}

const demo: Demo = {
  demo: {} as Demo,
  nice: 5,
  hey: 2,
  what: "hey",
  aaa: [3, 2, 1]
};

demo.demo = demo;

console.log(demo);

interface Ref {
  $ref: number;
}

const replacer = (): Replacer => {
  const refs = new WeakMap<object, Ref>();
  let id: number = 0;
  return function(key, value: unknown) {
    if (typeof value !== "object" || value === null) return value;
    if (refs.has(value)) return refs.get(value)!;
    refs.set(value, { $ref: id++ });
    return value;
  };
}

const reviver = (): Reviver => {
  const refs = new Map<number, Ref>();
  let id: number = 0;
  return function(key, value: unknown) {
    if (typeof value !== "object" || value === null) return value;
    if ("$ref" in value && typeof value.$ref === "number") {
      return refs.get(id);
    } else {
      refs.set(id++, value as Ref);
      return value;
    }
  };
}

const globb = JSON.stringify(demo, replacer());

const globbed: typeof demo = JSON.parse(globb, reviver());
console.log(globbed);

// deepStrictEqual(demo, globbed);