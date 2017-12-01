
/**
 * Coerces/Forces a data-bound value (typically a string) to a number.
 * @param value Value to be coerce
 * @param fallbackValue Fallback value when the conversion returns Null/Nan
 *
 * `Recommendation:` This should be use for @Input variable since we just want
 * to make sure that the inputted value is not string unless you want it
 * to use for other purposes
 */
export function coerceNumber(value: any, fallbackValue = 0) {
  return isNaN(parseFloat(value as any)) || isNaN(Number(value)) ? fallbackValue : Number(value);
}

/**
 * Coerces/Forces a data-bound value (typically a string) to a boolean.
 * @param value Value to be coerce
 *
 * `Recommendation:` This should be use for @Input variable since we just want
 * to make sure that the inputted value is not string unless you want it
 * to use for other purposes
 */
export function coerceBoolean(value: any): boolean {
  return value != null && `${value}` !== 'false';
}

/**
 * Wraps the provided value in an array, unless the provided value is an array.
 * @param value Value to be coerce
 *
 * `Recommendation:` This should be use for @Input variable since we just want
 * to make sure that the inputted value is not string unless you want it
 * to use for other purposes
 */
export function coerceArray<T>(value: T | T[]): T[] {
  return Array.isArray(value) ? value : [value];
}
