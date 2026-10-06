// Safe reads and writes for keys or indexes that are variables.
//
// Plain record[key] and array[i] are flagged by the security lint rule
// detect-object-injection. These helpers do the same job, and only ever
// touch the record's own keys, so inherited names such as "constructor" are
// never returned.

// For keys that are always present (for example a fully typed record).
export function lookup<K extends PropertyKey, V>(record: Readonly<Record<K, V>>, key: K): V {
  return lookupOptional<K, V>(record, key) as V;
}

// For keys that may be missing. Returns undefined when the key isn't there.
export function lookupOptional<K extends PropertyKey, V>(
  record: Readonly<Partial<Record<K, V>>>,
  key: K
): V | undefined {
  const name = String(key);
  const entry = Object.entries(record).find(([k]) => k === name);
  return entry?.[1] as V | undefined;
}

// Writes an array element only when the index is inside the array.
export function setAt<T>(array: T[], index: number, value: T): void {
  if (index < 0 || index >= array.length) return;
  // Index is bounds-checked just above, so this write can't reach a
  // prototype key.
  // eslint-disable-next-line security/detect-object-injection
  array[index] = value;
}
