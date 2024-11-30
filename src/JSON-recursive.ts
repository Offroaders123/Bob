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
  return function(_key, value: unknown) {
    if (typeof value === "object" && value !== null) {
      if (!unique.has(value)) {
        const id: number = i;
        unique.set(value, id);
        i++;
        if (Array.isArray(value)) {
          return [id, ...value];
        } else {
          return { ...value, $id: id };
        }
      } else {
        return { $ref: unique.get(value) ?? (() => { throw new Error("Couldn't find ref!") })() } satisfies Ref;
      }
    }
    return value;
  };
}

const reviver = (): Reviver => {
  const unique: object[] = [];
  const pending: { parent: any; key: string | number; ref: number; }[] = [];

  return function(key, value: unknown) {
    if (typeof value === "object" && value !== null) {
      if ("$ref" in value && typeof value.$ref === "number") {
        const id: number = value.$ref;
        if (unique[id]) {
          return unique[id];
        }
        pending.push({ parent: this, key, ref: id });
        return value;
      } else if ("$id" in value && typeof value.$id === "number") {
        const id: number = value.$id;
        delete value.$id;
        unique[id] = value;
      } else if (Array.isArray(value)) {
        const id: number = value.shift();
        unique[id] = value;
        return value;
      }
    }

    if (key === "" && pending.length) {
      for (const { parent, key, ref } of pending) {
        if (unique[ref]) {
          parent[key] = unique[ref];
        } else {
          throw new Error(`Unresolved reference: $ref ${ref}`);
        }
      }
      unique.length = 0;
      pending.length = 0;
    }
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

deepStrictEqual(demo, globbed);