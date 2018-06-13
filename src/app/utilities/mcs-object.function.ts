import {
  Subscription,
  Subject
} from 'rxjs/Rx';
import { isNullOrUndefined } from 'util';

/**
 * This will check if the inputted object is null/undefined or empty,
 * `@Note` This will return true if the object is null/empty otherwise false
 * @param data Data object to be check of
 */
export function isNullOrEmpty<T>(data: T): boolean {
  // Return object in case it is null / undefined already
  if (data === null || data === undefined) { return true; }
  if (data instanceof Array) {
    return !(data ? data.length > 0 : false);
  } else {
    return !data;
  }
}

/**
 * This will safely unsubscribe a subscription
 * @param subscription subscription to unsubscribe
 */
export function unsubscribeSafely(subscription: Subscription): void {
  if (isNullOrEmpty(subscription)) { return; }
  subscription.unsubscribe();
}

/**
 * Unsubscribe the subject to kill its reference
 * @param subject Subject to be killed
 */
export function unsubscribeSubject(subject: Subject<any>): void {
  if (isNullOrEmpty(subject)) { return; }
  subject.next();
  subject.complete();
}

/**
 * Update the object data without removing the instance of the source element
 * @param source Source object to be updated
 * @param target Target object to be the basis
 */
export function updateObjectData(source: any, target: any): void {
  let keys = Object.keys(target);
  keys.forEach((key) => source[key] = target[key]);
}

/**
 * Returns the safe value based on the object to access the deep property
 * @param obj Object to get deep property
 * @param predicateOperator Function that returns the deep property
 * @param valueIfFail Value to return in case if there is no such property
 */
export function getSafeProperty<O, T>(
  obj: O,
  predicateOperator?: (x: O) => T,
  valueIfFail?: any): T | O {
  try {
    // Validate used object
    if (isNullOrUndefined(obj)) { return valueIfFail; }

    // Validate predicate operator and return the object if it is null
    if (isNullOrUndefined(predicateOperator)) { return obj; }

    // Return the predicate
    return isNullOrUndefined(predicateOperator(obj)) ? valueIfFail : predicateOperator(obj);
  } catch (_error) {
    return valueIfFail;
  }
}
