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
  const unique = new WeakMap<object, number>();
  let i: number = 0;
  return function(key, value: unknown) {
    if (typeof value === "object" && value !== null) {
      if (!unique.has(value)) {
        unique.set(value, i);
        i++;
        return value;
      } else {
        return { $ref: unique.get(value) ?? (() => { throw new Error("Couldn't find ref!") })() } satisfies Ref;
      }
    }
    return value;
  };
}

const reviver = (): Reviver => {
  const unique = new Map<number, object>();
  let i: number = 0;
  return function(key, value: unknown) {
    if (typeof value === "object" && value !== null) {
      if ("$ref" in value && typeof value.$ref === "number") {
        return unique.get(value.$ref) ?? (() => { throw new Error("Couldn't find ref!"); })();
      } else {
        unique.set(i, value);
        i++;
        return value;
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