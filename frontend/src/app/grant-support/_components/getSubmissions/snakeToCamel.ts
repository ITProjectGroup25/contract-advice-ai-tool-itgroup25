// Utility type to convert snake_case string literals to camelCase
type CamelCase<S extends string> = S extends `${infer T}_${infer U}`
  ? `${T}${Capitalize<CamelCase<U>>}`
  : S;

// Recursively convert object keys from snake_case to camelCase
export type Camelize<T> = T extends readonly (infer U)[]
  ? Camelize<U>[]
  : T extends object
  ? {
      [K in keyof T as K extends string ? CamelCase<K> : K]: Camelize<T[K]>;
    }
  : T;

// Runtime function to convert snake_case string to camelCase
const snakeToCamel = (str: string) =>
  str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());

// Runtime function to recursively convert object keys
function convertKeysToCamel<T>(obj: T): Camelize<T> {
  if (Array.isArray(obj)) {
    return obj.map((item) => convertKeysToCamel(item)) as any;
  } else if (obj !== null && typeof obj === "object") {
    return Object.entries(obj).reduce((acc, [key, value]) => {
      const camelKey = snakeToCamel(key);
      (acc as any)[camelKey] = convertKeysToCamel(value);
      return acc;
    }, {} as any);
  } else {
    return obj as any;
  }
}

export default convertKeysToCamel;
