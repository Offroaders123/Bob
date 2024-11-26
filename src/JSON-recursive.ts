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
  return function(key, value: unknown) {
    return value;
  };
}

const reviver = (): Reviver => {
  return function(key, value: unknown) {
    return value;
  };
}

const globb = JSON.stringify(demo, replacer());
console.log(globb);

const globbed: typeof demo = JSON.parse(globb, reviver());
console.log(globbed);

// deepStrictEqual(demo, globbed);