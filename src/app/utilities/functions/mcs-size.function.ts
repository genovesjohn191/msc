

let gbToMbMultiplier = 1024;
let kbToMbMultiplier = 1024;
let gbitToMbitMultiplier = 1000;

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

/**
 * This will return the value converted from Megabit to Gigabit
 * @param value Value in Megabit
 */
export function convertMbitToGbit(value: number): number {
  if (!value) { return 0; }

  return (value / gbitToMbitMultiplier);
}

/**
 * This will return the value converted from Gigabit to Megabit
 * @param value Value in Gigabit
 */
 export function convertGbitToMbit(value: number): number {
  if (!value) { return 0; }

  return (value * gbitToMbitMultiplier);
}
