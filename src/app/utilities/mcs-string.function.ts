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

/**
 * This will return the full string content and replace the
 * placeholder using the actual value
 * @param fullString Full string content with placeholder
 * @param placeholderName Placeholder name to be find in the fullstring
 * @param placeholderValue Placeholder value to set in the replacement
 */
export function replacePlaceholder(
  fullString: string,
  placeholderName: string,
  placeholderValue: string
): string {
  if (!fullString) { return undefined; }
  return fullString.replace(`{{${placeholderName}}}`, placeholderValue);
}

/**
 * Converts the enumeration value to string equivalent
 *
 * `@Important:` Make sure your enumeration index started with 0.
 * And also different enumeration value is not supported
 * @param enumRef Reference type of the enumeration
 * @param enumValue Value to be converted as string
 */
export function getEnumString<T>(enumRef: T, enumValue: any): string {
  // Get the string equivalent of enumeration
  // First half is the numerical values, while the second half are strings
  let statusObjects = Object.keys(enumRef);
  statusObjects = statusObjects.slice(statusObjects.length / 2);

  return statusObjects ? statusObjects[(enumValue) as number] : '';
}

/**
 * This will return the record count label for tables
 *
 * @param count number of records
 * @param singularSuffix Suffix to use if count is 1
 * @param pluralSuffix Suffix to use if count is greater than 11
 */
export function getRecordCountLabel(count: number, singularSuffix: string, pluralSuffix: string) {
  let recordCountLabel: string = '';
  if (count > 0) {
    let prefix = count.toString();
    let suffix: string = count === 1
      ? singularSuffix
      : pluralSuffix;
    recordCountLabel = prefix + ' ' + suffix;
  }

  return recordCountLabel;
}

/**
 * This will compare two strings and will return the ffg:
 *
 * -1 = firstString < secondString
 * 0 = firstString > secondString
 * 1 = firstString === secondString
 *
 * @param firstString First string to compare
 * @param secondString Second string to compare
 */
export function compareStrings(firstString: string, secondString: string): number {
  let a = firstString.toLowerCase();
  let b = secondString.toLowerCase();

  if (a === b) {
    return 0;
  } else {
    return (a < b) ? -1 : 1 ;
  }
}
