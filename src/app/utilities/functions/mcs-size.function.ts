let gbToMbMultiplier = 1024;
let kbToMbMultiplier = 1024;

/**
 * This will return the value converted from MB to GB
 * @param value Value in MB
 */
export function convertMbToGb(value: number): number {
  if (!value) { return 0; }

  return (value / gbToMbMultiplier);
}

/**
 * This will return the value converted from GB to MB
 * @param value Value in GB
 */
export function convertGbToMb(value: number): number {
  if (!value) { return 0; }

  return (value * gbToMbMultiplier);
}

/**
 * This will return the value converted from KB to MB
 * @param value Value in KB
 */
export function convertKbToMb(value: number): number {
  if (!value) { return 0; }

  return (value / kbToMbMultiplier);
}
