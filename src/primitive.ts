export type BOBPrimitive = string | number | boolean | null | BOBArray<BOBPrimitive> | BOBObject;

export interface BOBArray<T extends BOBPrimitive | undefined> extends Array<T> {}

export interface BOBObject {
  [key: string]: BOBPrimitive | undefined;
}

export enum TAG {
  END = -1,
  NULL,
  BOOLEAN,
  NUMBER,
  STRING,
  ARRAY,
  OBJECT
}

export function getTag(value: BOBPrimitive): TAG;
export function getTag(value: unknown): TAG | null;
export function getTag(value: unknown): TAG | null {
  switch (true) {
    case typeof value === "string": return TAG.STRING;
    case typeof value === "number": return TAG.NUMBER;
    case typeof value === "boolean": return TAG.BOOLEAN;
    case value === null: return TAG.NULL;
    case Array.isArray(value): return TAG.ARRAY;
    case typeof value === "object": return TAG.OBJECT;
    default: return null;
  }
}