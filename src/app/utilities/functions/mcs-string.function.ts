import { isNullOrEmpty } from "./mcs-object.function";

const regex = /\w\S*/g;
const DEFAULT_PHONENUMBER_FORMAT_REGEX: RegExp = /^(\d{4})(\d{3})(\d{3})$/;
const FIRST_LETTER_OF_EACH_WORD_TO_UPPERCASE_REGEX: RegExp = /(^\w{1})|(\s+\w{1})/g;

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
  placeholderNames: string | string[],
  placeholderValues: string | string[]
): string {
  if (!fullString) { return undefined; }

  let placeholders: string[];
  let values: string[];

  // Set values based on parameters input
  placeholders = Array.isArray(placeholderNames) ? placeholderNames
    : new Array<string>(String(placeholderNames));
  values = Array.isArray(placeholderValues) ? placeholderValues
    : new Array<string>(String(placeholderValues));
  if (placeholders.length !== values.length) {
    throw new Error('Count of placeholders and values are not the same');
  }

  // Replace all occurence placeholder strings based on search pattern
  let replacedString: string = fullString;
  for (let index = 0; index < placeholders.length; index++) {
    replacedString = replacedString.replace(
      new RegExp(`{{${placeholders[index]}}}`, 'g'), values[index]
    );
  }
  return replacedString;
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
 * 0 = firstString === secondString
 * 1 = firstString > secondString
 *
 * @param firstString First string to compare
 * @param secondString Second string to compare
 */
export function compareStrings(firstString: string, secondString: string): number {
  if (!firstString) { firstString = ''; }
  if (!secondString) { secondString = ''; }
  let a = firstString.toLowerCase();
  let b = secondString.toLowerCase();

  if (a === b) {
    return 0;
  } else {
    return (a < b) ? -1 : 1;
  }
}

/**
 * Returns true when the target text found in source text.
 * @param source Source text where the target string will be compared
 * @param target Target text or keyword to be compared
 */
export function containsString(source: string, target: string): boolean {
  if (!source) { source = ''; }
  if (!target) { target = ''; }

  let sourceString = source.toLowerCase();
  let targetString = target.toLowerCase();
  return sourceString.indexOf(targetString) !== -1;
}

/**
 * Returns the converted string spaces to dash
 */
export function convertSpacesToDash(source: string): string {
  return source?.replace(/\s+/g, '-').toLowerCase();
}

/**
 * Returns the string without spaces
 */
export function removeSpaces(source: string): string {
  return source?.replace(/\s+/g, '');
}

/**
 * Returns the string without spaces and non-alphanumeric characters
 */
 export function removeNonAlphaNumericChars(source: string): string {
  return source?.replace(/[^0-9a-z]/gi, '');
}

// TO DO: create a pipe to convert all string format to text
export function formatStringToText(source: string): string {
  return source?.replace(/(\t)/g, ' ');
}

/**
 * Returns the converted string numbers to phone number
 */
export function formatStringToPhoneNumber(
  source: string,
  customFormatRegex: RegExp = null,
  removeCountryCodes: boolean = false
): string {
  let result: string = null;
  if (!source) { return result; }
  let trimmedNumberString = source.replace(/\D/g, '');

  if (trimmedNumberString) {
    let [first, ...rest] = (customFormatRegex) ? trimmedNumberString.match(customFormatRegex)
      : trimmedNumberString.match(DEFAULT_PHONENUMBER_FORMAT_REGEX);
    if (customFormatRegex) {
      result = first;
    } else {
      result = rest.join(' ');
    }

    if (removeCountryCodes) {
      let removedCountryCode = result.slice(-10);
      result = removedCountryCode;
    }
  }
  return result;
}

export function formatFirstLetterOfEachWordToUpperCase(source: string): string {
  return source.replace(FIRST_LETTER_OF_EACH_WORD_TO_UPPERCASE_REGEX, letter => letter.toUpperCase());
}

export function removeHTMLTagAndFormat(description: string): string {
  if (isNullOrEmpty(description)) { return; }
  description = description.replace(/<\/p>/gi, '\r\n\r\n');
  description = description.replace(/<br ? \/?>/gi, '\r\n');
  description = description.replace(/(<([^>]+)>)/gi, '');
  return description;
}
