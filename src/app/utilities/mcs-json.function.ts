import { ObjectMapper } from 'json-object-mapper';

const dateFormat = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;

/**
 * Filter any variable type from json and convert it to corresponding javascript/typescript type
 * @param _key Key or the property name
 * @param value Propery value
 */
export function reviverParser(_key, value): any {
  // Convert all date to javascript date
  if (typeof value === 'string' && dateFormat.test(value)) {
    return new Date(value);
  }
  return value;
}

/**
 * Serialize object to json using json-object-mapper
 * @param object Object that will be converted to json
 */
export function serializeObjectToJson<T>(object: T): string {
  let convertedJson: string;

  // Check for null input parameter
  if (!object) { return undefined; }

  try {
    // Try to convert JSON to Object
    convertedJson = ObjectMapper.serialize(object) as string;
  } catch (error) {
    convertedJson = undefined;
  }
  return convertedJson;
}

/**
 * Deserialize json content to object based on "T" type
 * @param classType Class type to get the instance from
 * @param json JSON content to be converted as type "T"
 */
export function deserializeJsonToObject<T>(
  classType: new () => T,
  json: any): T {
  let convertedObject: any;

  // Check for null input parameter
  if (!json) { return undefined; }

  try {
    if (Array.isArray(json)) {
      convertedObject = ObjectMapper.deserializeArray(classType, json);
    } else {
      convertedObject = ObjectMapper.deserialize(classType, json) as T;
    }

  } catch (error) {
    convertedObject = undefined;
  }
  return convertedObject;
}

/**
 * Convert the map contents into JSON object
 * @param map Map to be converted as JSON
 * @param removeNulls Remove null objects when this flag is true
 */
export function convertMapToJsonObject(
  map: Map<any, any>,
  removeNulls: boolean = true
): any {
  // Check for null input parameter
  if (!map) { return undefined; }
  let obj = Object.create(null);

  // Append the value of map to object
  map.forEach((value, key) => {
    if (removeNulls) {
      if (value !== undefined && value !== null) { obj[key] = value; }
    } else {
      obj[key] = value;
    }
  });
  return obj;
}

/**
 * Returns true when the object is JSON, otherwise false
 * @param content String to checked
 */
export function isJson(content: string | any): boolean {
  try {
    JSON.parse(content);
  } catch (e) {
    return false;
  }
  return true;
}
