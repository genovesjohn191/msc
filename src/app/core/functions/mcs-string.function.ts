const regex = /\w\S*/g;

/**
 * Convert string to proper case
 * @param text string to be converted
 */
export function toProperCase(text: string): string {
  // Convert to proper case
  return text.replace(regex, (str) => str[0].toUpperCase() + str.substr(1).toLowerCase());
}
