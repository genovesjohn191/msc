const regex = /\w\S*/g;

/**
 * This will return the inputted string to proper casing
 * @param text string to be converted
 */
export function getProperCase(text: string): string {
  // Convert to proper case
  return text.replace(regex, (str) => str[0].toUpperCase() + str.substr(1).toLowerCase());
}

/**
 * This will return the encoded string based on the arguments
 * @param fileType Filetype of the file to be encoded
 * @param file File path to be encoded
 * @param encoding Encoding type
 */
export function getEncodedUrl(file: string, fileType: string, encoding: string): string {
  // Return the encoding value
  return `data:${fileType};${encoding},${file}`;
}
