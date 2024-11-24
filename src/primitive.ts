export type BOBPrimitive<K extends keyof BOBPrimitiveMap = keyof BOBPrimitiveMap> = BOBPrimitiveMap[K];

export interface BOBPrimitiveMap {
  NULL: null;
  BOOLEAN: boolean;
  NUMBER: number;
  STRING: string;
  ARRAY: BOBArray;
  OBJECT: BOBObject;
}

export type BOBArray = unknown[];

export type BOBObject = Record<string, unknown>;

export enum TAG {
  END = -1,
  NULL,
  BOOLEAN,
  NUMBER,
  STRING,
  ARRAY,
  OBJECT
}

export function isTag<T extends BOBPrimitive>(value: unknown): value is T {
  return getTag(value) !== null;
}

export function isTagType(type: unknown): type is TAG {
  return typeof type === "number" && type in TAG;
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