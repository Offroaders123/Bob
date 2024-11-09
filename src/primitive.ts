export type BOBPrimitive = string | number | boolean | null | BOBArray<BOBPrimitive> | BOBObject;

export interface BOBArray<T extends BOBPrimitive> extends Array<T> {}

export interface BOBObject {
  [key: string]: BOBPrimitive | undefined;
}