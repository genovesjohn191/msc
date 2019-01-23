import {
  Subscription,
  Subject
} from 'rxjs';
import { deserializeJsonToObject } from './mcs-json.function';

/**
 * This will check if the inputted object is null/undefined or empty,
 * `@Note` This will return true if the object is null/empty otherwise false
 * @param data Data object to be check of
 */
export function isNullOrEmpty<T>(data: T): boolean {
  // Return object in case it is null / undefined already
  if (data === null || data === undefined) { return true; }
  if (data instanceof Array) {
    let actualArrayData = data.filter((record) => !!record);
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
 * This will safely unsubscribe a subscription
 * @param subscriber subscription to unsubscribe
 */
export function unsubscribeSafely(subscriber: Subscription | Subject<any>): void {
  if (isNullOrEmpty(subscriber)) { return; }

  if (subscriber instanceof Subscription) {
    subscriber.unsubscribe();
  } else {
    subscriber.next();
    subscriber.complete();
  }
}

/**
 * Unsubscribe the subject to kill its reference
 * @param subject Subject to be killed
 * @deprecated use the unsubscribeSafely instead
 */
export function unsubscribeSubject(subject: Subject<any>): void {
  if (isNullOrEmpty(subject)) { return; }
  subject.next();
  subject.complete();
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
 * Creates new object from source object by deserializing its content
 * @param objectType Object type to be created
 * @param sourceObject Source object from which to copy the object
 */
export function createNewObject<T>(objectType: new () => any, sourceObject: T): T {
  return deserializeJsonToObject<T>(objectType, sourceObject);
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
