// https://www.youtube.com/watch?v=wEtyYNFOIew&list=PL2B1pJtmgd8B6MlOddpULaLbTdEncOWj4
// https://www.google.com/search?q=json+replacer+reviver
// https://gist.github.com/jimmywarting/a6ae45a9f445ca352ed62374a2855ff2
// https://stackoverflow.com/questions/65876907/how-to-add-a-global-replacer-for-json-stringify-and-global-reviver-for-json-pars
// https://github.com/jprichardson/buffer-json
// https://dev.to/dvddpl/revive-your-json-examples-with-tdd-and-composition-3

import { deepStrictEqual } from "node:assert";

// Now I'm listening to Devy Lightwork, and relaxing asmr :)

const heya = {
  nice: new Uint8Array([45, 82, 19, 43, 0, 1, 2, 3, 4, 5]),
  heya: 25n,
  what: [
    {
      aa: "Sweet",
      l: {}
    }
  ],
  sets: new Set([
    new Set([25, {}]),
    new Set([92, 5n])
  ])
};
console.log(heya);

export type Replacer = (this: any, key: string, value: any) => any;

export type Reviver = (this: any, key: string, value: any) => any;

const replacer: Replacer = function (_key, value) {
  // console.log("THIS", _key, this);
  // console.log("VALUE", value);
  switch (true) {
    case value instanceof Uint8Array: return ["$__Uint8Array", ...value];
    case typeof value === "bigint": return ["$__bigint", value.toString()];
    case value instanceof Set: return ["$__Set", ...value];
    default: return value;
  }
  // return value;
};

const reviver: Reviver = function (_key, value) {
  // console.log("THIS", _key, this);
  // console.log("VALUE", value);
  if (!Array.isArray(value)) return value;
  switch (value[0]) {
    case "$__Uint8Array": return Uint8Array.from(value.slice(1));
    case "$__bigint": return BigInt(value[1]);
    case "$__Set": return new Set(value.slice(1));
    default: return value;
  }
  // return value;
};

const stringy: string = JSON.stringify(heya, replacer);

const heyay: typeof heya = JSON.parse(stringy, reviver);
console.log(heyay);

deepStrictEqual(heya, heyay);
