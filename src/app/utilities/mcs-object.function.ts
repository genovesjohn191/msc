import {
  Subscription,
  Subject
} from 'rxjs';
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
 * @param target The target object to copy to.
 * @param source The source object from which to copy records.
 */
export function updateObjectData(target: any, ...source: any[]): void {
  if (isNullOrUndefined(source)) { return; }
  target = Object.assign(target || {}, ...source);
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
