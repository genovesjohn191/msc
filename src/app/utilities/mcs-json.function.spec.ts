import { async } from '@angular/core/testing';
import {
  reviverParser,
  convertMapToJsonObject,
  serializeObjectToJson,
  deserializeJsonToObject,
  isJson
} from './mcs-json.function';

// Dummy test object class
export class TestObject {
  public name: string;
  public id: string;

  constructor() {
    this.name = undefined;
    this.id = undefined;
  }
}

describe('JSON Functions', () => {
  describe('reviverParser()', () => {
    it(`should convert JSON date type to typescript/javascript date`, () => {
      let typescriptDate = reviverParser(undefined, '2017-04-26T01:55:12Z');
      expect(typescriptDate).toEqual(jasmine.any(Date));
    });

    it(`should convert JSON string type to typescript/javascript string`, () => {
      let typescriptString = reviverParser(undefined, 'content');
      expect(typescriptString).toEqual(jasmine.any(String));
    });

    it(`should convert JSON number type to typescript/javascript number`, () => {
      let typescriptNumber = reviverParser(undefined, 1);
      expect(typescriptNumber).toEqual(jasmine.any(Number));
    });
  });

  describe('serializeObjectToJson()', () => {
    it(`should convert object to JSON when no error occured`, () => {
      let testObject = new TestObject();
      testObject.id = 'F500120501';
      testObject.name = 'arrian';
      let convertedJson = serializeObjectToJson<TestObject>(testObject);
      expect(convertedJson).toBeDefined();
    });

    it(`should return undefined when there error occured in conversion`, () => {
      let convertedJson = serializeObjectToJson<TestObject>(undefined);
      expect(convertedJson).toBeUndefined();
    });
  });

  describe('deserializeJsonToObject()', () => {
    it(`should convert JSON to object when no error occured`, () => {
      let convertedObject = deserializeJsonToObject<TestObject>(TestObject,
        { id: 'F500120501', name: 'arrian' });
      expect(convertedObject).toBeDefined();
      expect(convertedObject.id).toBe('F500120501');
      expect(convertedObject.name).toBe('arrian');
    });

    it(`should return undefined when error occured in conversion`, () => {
      let json = serializeObjectToJson(undefined);
      let convertedObject = deserializeJsonToObject<TestObject>(TestObject, json);
      expect(convertedObject).toBeUndefined();
    });
  });

  describe('convertMapToJsonObject()', () => {
    let testObject = new Map<string, string>();
    beforeEach(async(() => {
      testObject.set('first', 'value1');
      testObject.set('second', 'value2');
    }));

    it(`should convert MAP to JSON object`, () => {
      let convertedObject = convertMapToJsonObject(testObject);
      expect(convertedObject).toBeDefined();
      expect(convertedObject.first).toBe('value1');
      expect(convertedObject.second).toBe('value2');
    });
  });

  describe('isJson()', () => {
    it(`should return true when the object is convertible to JSON`, () => {
      let testObject = { name: 'sample' };
      let jsonObject = isJson(JSON.stringify(testObject));
      expect(jsonObject).toBeTruthy();
    });

    it(`should return false when the object is not convertible to JSON`, () => {
      let testObject = 'sample';
      let jsonObject = isJson(testObject);
      expect(jsonObject).toBeFalsy();
    });
  });
});
