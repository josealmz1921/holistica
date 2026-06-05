// utils/options.ts
import type { Option } from "@/src/types/selectTypes";
// Safely stringify any value (handles circular refs by falling back to Object tag)
const safeStringify = (v: unknown): string => {
    try {
        return JSON.stringify(v);
    } catch {
        return Object.prototype.toString.call(v);
    }
};

/** Convert any value into a stable key for comparisons. */
export const toKey = (v: unknown): string => (v == null ? "__NULL__" : typeof v === "object" ? safeStringify(v) : String(v));

/** Value equality using `toKey` (works for primitives and objects). */
export const isEqualVal = <T,>(a: T, b: T): boolean => toKey(a) === toKey(b);

/**
 * Find an option by `value` using value-based equality (deep for objects).
 * Returns the matched option or `null`.
 */
export const findOptionByValue = <T, O extends Option<T>>(options: readonly O[] | null | undefined, value: T): O | null => {
    if (!options?.length) return null;
    const key = toKey(value);
    return options.find((o) => toKey(o?.value) === key) ?? null;
};