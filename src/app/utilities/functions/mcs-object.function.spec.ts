import { Subscription } from 'rxjs';
import {
  isNullOrEmpty,
  isNullOrUndefined,
  unsubscribeSafely,
  updateObjectData,
  getSafeProperty,
  cloneObject,
  createObject,
  isEmptyObject,
  cloneDeep,
  convertRawObjectToString,
  IRawObject
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

    it('should return true if the Array object has only undefined content', () => {
      let arrayObject: string[] = new Array();
      arrayObject.push(undefined);
      let isEmpty = isNullOrEmpty(arrayObject);
      expect(isEmpty).toBeTruthy();
    });

    it('should return true if the Array object has only null contents', () => {
      let arrayObject: string[] = new Array();
      arrayObject.push(null);
      arrayObject.push(undefined);
      let isEmpty = isNullOrEmpty(arrayObject);
      expect(isEmpty).toBeTruthy();
    });

    it('should return false if the Array object has only 0 content', () => {
      let arrayObject: number[] = new Array();
      arrayObject.push(0);
      let isEmpty = isNullOrEmpty(arrayObject);
      expect(isEmpty).toBeFalsy();
    });

    it('should return false if the Array object has only empty string content', () => {
      let arrayObject: string[] = new Array();
      arrayObject.push('');
      let isEmpty = isNullOrEmpty(arrayObject);
      expect(isEmpty).toBeFalsy();
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

  describe('isEmptyObject()', () => {
    it('should return false when the value of the object provided is 0', () => {
      let numberObject: number = 0;
      expect(isEmptyObject(numberObject)).toBeTruthy();
    });

    it('should return false when the object provided is empty string', () => {
      let stringObject: string = '';
      expect(isEmptyObject(stringObject)).toBeTruthy();
    });

    it('should return false when the value of the object provided is an array', () => {
      let arrayObject: string[] = ['a', 'b', 'c'];
      expect(isEmptyObject(arrayObject)).toBeFalsy();
    });

    it('should return false when the object provided is a string', () => {
      let stringObject: string = 'hello';
      expect(isEmptyObject(stringObject)).toBeFalsy();
    });

    it('should return false when the value of the object provided is an object', () => {
      let arrayObject = { 0: 'a', 1: 'b', 2: 'c' };;
      expect(isEmptyObject(arrayObject)).toBeFalsy();
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

  describe('cloneObject()', () => {
    it('should mutate the provided object', () => {
      class TestClass {
        public name: string;
        public age: string;
      }
      let sourceInstance = { name: 'Arrian', age: '27' } as TestClass;
      let targetInstance = cloneObject(sourceInstance);
      expect(targetInstance).toBeDefined();
      expect(targetInstance).not.toBe(sourceInstance);
    });
  });

  describe('cloneDeep()', () => {
    it('should deep clone the provided source object', () => {
      class TestClass {
        public name: string;
        public age: number;
      }

      let sourceInstance = { name: 'Yvonne', age: 28 } as TestClass;
      let targetInstance = cloneDeep(sourceInstance);
      sourceInstance.age = 27;
      expect(targetInstance.age).toBe(28);
      expect(targetInstance.age).not.toBe(sourceInstance.age);
    });
  });

  describe('createObject()', () => {
    it('should create a new target object with populated fields', () => {
      class TestClass {
        public name: string;
        public age: string;
      }
      let targetInstance = createObject(TestClass, {
        name: 'Arrian',
        age: '28'
      });
      expect(targetInstance).toBeDefined();
      expect(targetInstance.name).toBe('Arrian');
      expect(targetInstance.age).toBe('28');
    });

    it('should successfully create a new target object given date source object', () => {
      let testDate = new Date();
      let targetInstance = cloneObject(testDate);
      expect(targetInstance).toBeDefined();
      expect(targetInstance instanceof Date).toBe(true);
    });
  });

  describe('convertRawObjectToString()', () => {
    it('should convert the raw object into a string', () => {
      let rawObject = {
        'mcs-select-field-size': 'xs'
      }

      let convertedRawObject = convertRawObjectToString(rawObject);

      expect(convertedRawObject).toBe('mcs-select-field-size-xs');
    });
    it('should convert the raw object with true value into a string', () => {
      let rawObject = { 'mcs-select-field': true }

      let convertedRawObject = convertRawObjectToString(rawObject);

      expect(convertedRawObject).toBe('mcs-select-field');
    });
    it('should convert the raw object with number value into a string', () => {
      let rawObject = { 'mcs-select-field': '0' }

      let convertedRawObject = convertRawObjectToString(rawObject);

      expect(convertedRawObject).toBe('mcs-select-field-0');
    });
    it('should not convert the item in the object with false value into a string', () => {
      let rawObject = {
        'mcs-select-field': false,
        'mcs-option-field': true
      }

      let convertedRawObject = convertRawObjectToString(rawObject);

      expect(convertedRawObject).toBe('mcs-option-field');
    });
    it('should convert the raw object with multiple object items into a string', () => {
      let rawObject = {
        'mcs-select-field': true,
        'mcs-select-field-position': 'bottom'
      }

      let convertedRawObject = convertRawObjectToString(rawObject);

      expect(convertedRawObject).toBe('mcs-select-field mcs-select-field-position-bottom');
    });
    it('should return an empty string if the raw object is empty', () => {
      let rawObject: IRawObject;

      let convertedRawObject = convertRawObjectToString(rawObject);

      expect(convertedRawObject).toBe('');
    });
    it('should return an empty string if the raw object is null', () => {
      let rawObject: IRawObject = null;

      let convertedRawObject = convertRawObjectToString(rawObject);

      expect(convertedRawObject).toBe('');
    });
  });
});
