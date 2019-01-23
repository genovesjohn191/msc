import {
  Subscription,
  Subject
} from 'rxjs';
import {
  isNullOrEmpty,
  isNullOrUndefined,
  unsubscribeSafely,
  unsubscribeSubject,
  updateObjectData,
  getSafeProperty,
  createNewObject
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

  describe('isNullOrUndefined()', () => {
    it('should return true when the object provided is null', () => {
      let nullObject = null;
      expect(isNullOrUndefined(nullObject)).toBeTruthy();
    });

    it('should return true when the object provided is undefined', () => {
      let undefinedObject: string;
      expect(isNullOrUndefined(undefinedObject)).toBeTruthy();
    });

    it('should return false when the object provided is empty string', () => {
      let stringObject: string = '';
      expect(isNullOrUndefined(stringObject)).toBeFalsy();
    });

    it('should return false when the value of the object provided is 0', () => {
      let numberObject: number = 0;
      expect(isNullOrUndefined(numberObject)).toBeFalsy();
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

  describe('getSafeProperty()', () => {
    it('should return the property value when object is not null or undefined', () => {
      let objectData = { 'first': 'data1', 'second': 'data2' };
      let propertyValue = getSafeProperty(objectData, (obj) => obj.first);
      expect(propertyValue).toBe('data1');
    });

    it('should return the fail value provided when the object is null or undefined', () => {
      let objectData: any;
      let failValue = getSafeProperty(objectData, (obj) => obj.first, 'sample');
      expect(failValue).toBe('sample');
    });

    it(`should return undefined value when the object is null or undefined
      and no provided fail value`, () => {
        let objectData: any;
        let failValue = getSafeProperty(objectData, (obj) => obj.first);
        expect(failValue).toBeUndefined();
      });
  });

  describe('createNewObject()', () => {
    it('should create a new object based on the source provided', () => {
      class TestClass {
        public name: string;
        public age: string;
      }
      let sourceInstance = { name: 'Arrian', age: '27' } as TestClass;
      let targetInstance = createNewObject(TestClass, sourceInstance);
      expect(targetInstance).toBeDefined();
      expect(targetInstance).not.toBe(sourceInstance);
    });
  });
});
