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
        return { ...value, $id: i - 1 };
      } else {
        return { $ref: unique.get(value) ?? (() => { throw new Error("Couldn't find ref!") })() } satisfies Ref;
      }
    }
    return value;
  };
}

const reviver = (): Reviver => {
  const refs: { [id: number]: object; } = {};
  const pendingRefs: { parent: object; key: string; ref: number }[] = [];

  return function(key, value: unknown) {
    if (typeof value === "object" && value !== null) {
      if ("$id" in value) {
        const id: number = value.$id;
        delete value.$id;
        refs[id] = value;
      }
      if ("$ref" in value) {
        const ref: number = value.$ref;
        return refs[ref] || pendingRefs.push({ parent: this, key, ref }) && value;
      }
    }

    pendingRefs.forEach(({ parent, key, ref }) => {
      if (refs[ref]) parent[key] = refs[ref];
    });

    return value;
  };
}

const globb = JSON.stringify(demo, replacer());
console.log(globb);

const globbed: typeof demo = JSON.parse(globb, reviver());
console.log(globbed);

console.log("Circular references restored:", globbed.demo === globbed);
console.log("Nested reference works:", globbed.gg.demo === globbed);
console.log("Array preserved:", globbed.aaa === globbed.gg.aaa);

// deepStrictEqual(demo, globbed);