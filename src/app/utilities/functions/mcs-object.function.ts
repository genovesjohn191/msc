import _ from 'lodash';
import {
  Subject,
  Subscription
} from 'rxjs';

/**
 * This will check if the inputted object is null/undefined or empty,
 * `@Note` This will return true if the object is null/empty otherwise false
 * @param data Data object to be check of
 */
export function isNullOrEmpty<T>(data: T): boolean {
  // Return object in case it is null / undefined already
  if (isNullOrUndefined(data)) { return true; }
  if (data instanceof Array) {
    let actualArrayData = data.filter((record) => !isNullOrUndefined(record));
    return !(actualArrayData ? actualArrayData.length > 0 : false);
  } else {
    return !data;
  }
}

/**
 * Returns true when the data provided is null or undefined
 * @param data Data to be checked
 */
export function isNullOrUndefined<T>(data: T): boolean {
  return data === null || data === undefined;
}

/**
 * Returns true if the object has
 * @param data Data to be checked
 */
export function isEmptyObject<T>(obj: T): boolean {
  return Object.keys(obj).length === 0;
}

/**
 * This will safely unsubscribe a subscription
 * @param subscriber subscription to unsubscribe
 */
export function unsubscribeSafely(subscriber: Subscription | Subject<any>): void {
  if (isNullOrEmpty(subscriber)) { return; }

  if (subscriber instanceof Subscription) {
    subscriber.unsubscribe();
  } else {
    subscriber.next(null);
    subscriber.complete();
  }
}

/**
 * Update the object data without removing the instance of the source element
 * @param target The target object to copy to.
 * @param source The source object from which to copy records.
 */
export function updateObjectData(target: any, ...source: any[]): void {
  if (isNullOrUndefined(source)) { return; }
  target = Object.assign(target || {}, ...source);
}

/**
 * Deep clone the object based on its source
 * @param sourceObject Source object from which to copy the object
 */
export function cloneObject<T>(sourceObject: T): T {
  let memberwiseClone = (source: any) => {
    if (isNullOrUndefined(source)) { return source; }
    let target: any;
    if (typeof source === 'object') {
      target = isNullOrUndefined(source.constructor) ?
        new Object() : new source.constructor();
    } else {
      target = source;
    }

    Object.assign(target, source);
    if (target instanceof Date) {
      target = source;
    } else if (typeof target === 'object') {
      let objectKeys = Object.keys(target);

      objectKeys.forEach((fieldKey) => {
        let fieldType = typeof target[fieldKey];
        let fieldValue = target[fieldKey];

        target[fieldKey] = fieldType === 'object' ?
          memberwiseClone(fieldValue) :
          fieldValue;
      });
    }
    return target;
  };
  return memberwiseClone(sourceObject);
}

/**
 * Deep clone the object using lodash
 * @param sourceObject Source object to copy
 */
export function cloneDeep<T>(sourceObject: T): T {
  return _.cloneDeep(sourceObject);
}

/**
 * Returns the safe value based on the object to access the deep property
 * @param obj Object to get deep property
 * @param predicateOperator Function that returns the deep property
 * @param valueIfFail Value to return in case if there is no such property
 */
export function getSafeProperty<O, T>(
  obj: O,
  predicateOperator: (x: O) => T,
  valueIfFail?: any): T {
  try {
    // Validate used object
    if (isNullOrUndefined(obj)) { return valueIfFail; }

    // Return the predicate
    return isNullOrUndefined(predicateOperator(obj)) ? valueIfFail : predicateOperator(obj);
  } catch (_error) {
    return valueIfFail;
  }
}

type FilterProperty<T, K> = T extends K ? T : never;
/**
 * Creates an object based on the target element
 * @target Target instance to be created
 * @fields Property members of the target class
 */
export function createObject<T, K>(target: new (...args: any[]) => T, fields: FilterProperty<T, K>): T {
  if (isNullOrEmpty(target)) {
    throw new Error(`Unable to find prototype of ${target} object`);
  }
  return Object.assign(new target(), fields);
}

export interface IRawObject { [key: string]: any; }
/**
 * Converts raw object to string
 * @param rawObject Raw object to be converted
 */
export function convertRawObjectToString(rawObject: IRawObject): string {
  if (isNullOrEmpty(rawObject)) { return ''; }
  let objectKeys = Object.keys(rawObject) || [];
  let classesOutput: string[] = [];

  objectKeys.forEach((objectKey) => {
    let objectValue = rawObject[objectKey];
    if (isNullOrEmpty(objectValue)) { return; }

    if (typeof (objectValue) === 'boolean' && objectValue) {
      classesOutput.push(objectKey);
      return;
    }
    classesOutput.push(`${objectKey}-${objectValue}`);
  });
  return classesOutput.join(' ');
}