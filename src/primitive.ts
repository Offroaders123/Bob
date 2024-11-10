export type BOBPrimitive = string | number | boolean | null | BOBArray<BOBPrimitive> | BOBObject;

export interface BOBArray<T extends BOBPrimitive> extends Array<T> {}

export interface BOBObject {
  [key: string]: BOBPrimitive | undefined;
}

export enum TAG {
  STRING = 0,
  NUMBER,
  BOOLEAN,
  NULL,
  ARRAY,
  OBJECT
}