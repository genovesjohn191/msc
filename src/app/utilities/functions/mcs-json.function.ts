import { isArray } from './mcs-array.function';
import { isNullOrEmpty } from './mcs-object.function';
import { serialize, deserialize, IJsonObject } from '@peerlancers/json-serialization';

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
export function serializeObjectToJson<T>(object: T): IJsonObject {
  let convertedJson: IJsonObject;
  if (!object) { return undefined; }

  try {
    // Try to convert JSON to Object
    convertedJson = serialize(object);
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
export function deserializeJsonToObject<T>(classType: new () => any, json: any): T {
  let convertedObject: T;
  if (!json) { return undefined; }

  try {
    (convertedObject as any) = !isArray(json) ?
      deserialize<T>(classType, json) :
      Array.from(json).map((item) => deserialize<T>(classType, item));
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
 * Returns the converted json into map
 * @param json Json object to be converted
 */
export function convertJsonToMapObject<T>(json: string): Map<string, T> {
  let mapObject = new Map<string, T>();
  if (isNullOrEmpty(json)) { return mapObject; }

  // Converts the json object into keys and set to the mapping object
  let jsonKeys = Object.keys(json);
  if (!isNullOrEmpty(jsonKeys)) {
    jsonKeys.forEach((key) => {
      mapObject.set(key, json[key]);
    });
  }
  return mapObject;
}

/**
 * Returns true when the object is JSON, otherwise false
 * @param content String to checked
 */
export function isJson(content: string | any): boolean {
  if (typeof content === 'object') { return true; }
  try {
    JSON.parse(content);
  } catch (e) {
    return false;
  }
  return true;
}

/**
 * Compares the two json as object and return the status based on the comparison method:
 *
 * -1 = firstString < secondString
 * 0 = firstString === secondString
 * 1 = firstString > secondString
 *
 * @param firstObject First object to compare
 * @param secondObject Second object to compare
 */
export function compareJsons<T>(firstObject: T, secondObject: T): number {
  let firstJsonString: string = JSON.stringify(firstObject || {});
  let secondJsonString: string = JSON.stringify(secondObject || {});

  if (firstJsonString === secondJsonString) {
    return 0;
  } else {
    return (firstJsonString.length < secondJsonString.length) ? -1 : 1;
  }
}
