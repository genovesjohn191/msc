import { isNullOrEmpty } from './mcs-object.function';
import { convertMapToJsonObject } from './mcs-json.function';
import { compareStrings } from './mcs-string.function';

/**
 * This will compare two strings and will return the ffg:
 *
 * -1 = firstMap < secondMap
 * 0 = firstMap === secondMap
 * 1 = firstMap > secondMap
 *
 * @param firstMap First map to compare
 * @param secondMap Second map to compare
 */
export function compareMaps(
  firstMap: Map<any, any>,
  secondMap: Map<any, any>): number {

  // Initialization for undefined and null record
  if (isNullOrEmpty(firstMap)) { firstMap = new Map(); }
  if (isNullOrEmpty(secondMap)) { secondMap = new Map(); }

  let firstMapString = JSON.stringify(convertMapToJsonObject(firstMap));
  let secondMapString = JSON.stringify(convertMapToJsonObject(secondMap));
  return compareStrings(firstMapString, secondMapString);
}
