const dateFormat = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;

/**
 * Filter any variable type from json and convert it to corresponding javascript/typescript type
 * @param key Key or the property name
 * @param value Propery value
 */
export function reviverParser(key, value): any {
  // Convert all date to javascript date
  if (typeof value === 'string' && dateFormat.test(value)) {
    return new Date(value);
  }
  return value;
}

/**
 * Convert object to JSON string, if error occured during the conversion,
 * undefined value will returned and error will be printed in the console.
 * @param obj Object value to be converted
 */
export function convertObjectToJsonString<T>(obj: T): any {
  let jsonResult: any;

  // Check for null input parameter
  if (!obj) { return undefined; }

  try {
    // Try to convert object to JSON
    jsonResult = JSON.stringify(obj);
  } catch (error) {
    jsonResult = undefined;
  }
  return jsonResult;
}

/**
 * Convert JSON String to object, if error occured during the conversion,
 * undefined value will returned and error will be printed in the console
 * @param json JSON object to be converted
 * @param reviver Reviver parser during the conversion
 */
export function convertJsonStringToObject<T>(
  json: any,
  reviver?: (key: any, value: any) => any): T {
  let convertedObject: T;

  // Check for null input parameter
  if (!json) { return undefined; }

  try {
    // Try to convert JSON to Object
    convertedObject = JSON.parse(json, reviver);
  } catch (error) {
    convertedObject = undefined;
  }
  return convertedObject;
}
