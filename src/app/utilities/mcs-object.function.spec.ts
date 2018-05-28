import {
  Subscription,
  Subject
} from 'rxjs/Rx';
import {
  isNullOrEmpty,
  unsubscribeSafely,
  unsubscribeSubject,
  updateObjectData
} from './mcs-object.function';

describe('OBJECT Functions', () => {
  describe('isNullOrEmpty()', () => {
    it('should return true if the inputted object is null', () => {
      let data: any = null;
      let isNull = isNullOrEmpty(data);
      expect(isNull).toBeTruthy();
    });

    it('should return true if the inputted object is undefine', () => {
      let data: any;
      let isNull = isNullOrEmpty(data);
      expect(isNull).toBeTruthy();
    });

    it('should return true if the Array object is empty', () => {
      let arrayObject: string[] = new Array();
      let isEmpty = isNullOrEmpty(arrayObject);
      expect(isEmpty).toBeTruthy();
    });

    it('should return true if the String object is empty', () => {
      let stringObject: string = '';
      let isEmpty = isNullOrEmpty(stringObject);
      expect(isEmpty).toBeTruthy();
    });

    it('should return false if the inputted object is not null/undefined', () => {
      let data: any = { something: '' };
      let isNull = isNullOrEmpty(data);
      expect(isNull).toBeFalsy();
    });

    it('should return false if the Array object is not null or empty', () => {
      let arrayObject: string[] = new Array();
      arrayObject.push('angular');
      let isNull = isNullOrEmpty(arrayObject);
      expect(isNull).toBeFalsy();
    });

    it('should return false if the String object is not null or empty', () => {
      let stringObject: string = 'angular';
      let isEmpty = isNullOrEmpty(stringObject);
      expect(isEmpty).toBeFalsy();
    });
  });

  describe('unsubscribeSafely()', () => {
    it('should close the subscription', () => {
      let subscription = new Subscription();
      expect(subscription.closed).toBeFalsy();
      unsubscribeSafely(subscription);
      expect(subscription.closed).toBeTruthy();
    });
  });

  describe('unsubscribeSubject()', () => {
    it('should call the next of the subject', () => {
      let subject = new Subject();
      spyOn(subject, 'next');
      unsubscribeSubject(subject);
      expect(subject.next).toHaveBeenCalledTimes(1);
    });

    it('should call the complete of the subject', () => {
      let subject = new Subject();
      spyOn(subject, 'complete');
      unsubscribeSubject(subject);
      expect(subject.complete).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateObjectData()', () => {
    it('should update the source data without removing the instance of the source', () => {
      let sourceInstance = { name: 'arrian', age: 18 };
      let targetInstance = { name: 'arrian', age: 19 };
      updateObjectData(sourceInstance, targetInstance);
      expect(sourceInstance).not.toBe(targetInstance);
      expect(sourceInstance.age).toBe(19);
    });
  });
});
