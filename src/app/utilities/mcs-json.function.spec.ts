import {
  async
} from '@angular/core/testing';
import {
  reviverParser,
  convertJsonStringToObject,
  convertObjectToJsonString,
  convertMapToJsonObject
} from './mcs-json.function';

// Dummy test object class
export class TestObject {
  public name: string;
  public id: string;
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

  describe('convertObjectToJson()', () => {
    let testObject: TestObject;
    beforeEach(async(() => {
      testObject = new TestObject();
      testObject.id = 'F500120501';
      testObject.name = 'arrian';
    }));

    it(`should convert object to JSON when no error occured`, () => {
      let convertedJson = convertObjectToJsonString<TestObject>(testObject);
      expect(convertedJson).toBeDefined();
    });

    it(`should return undefined when there error occured in conversion`, () => {
      let convertedJson = convertObjectToJsonString<TestObject>(undefined);
      expect(convertedJson).toBeUndefined();
    });
  });

  describe('convertJsonToObject()', () => {
    let testObject: TestObject;
    beforeEach(async(() => {
      testObject = new TestObject();
      testObject.id = 'F500120501';
      testObject.name = 'arrian';
    }));

    it(`should convert JSON to object when no error occured`, () => {
      let json = `{ "name": "${testObject.name}", "id": "${testObject.id}" }`;

      let convertedObject = convertJsonStringToObject<TestObject>(json);
      expect(convertedObject).toBeDefined();
      expect(convertedObject.id).toBe(testObject.id);
      expect(convertedObject.name).toBe(testObject.name);
    });

    it(`should return undefined when error occured in conversion`, () => {
      let json = `{ "name": "${testObject.name}", "id: "${testObject.id}" }`; // ID format is wrong

      let convertedObject = convertJsonStringToObject<TestObject>(json);
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
});
