import {
  getProperCase,
  getEncodedUrl,
  replacePlaceholder,
  getEnumString,
  getRecordCountLabel,
  compareStrings,
  containsString
} from './mcs-string.function';

describe('STRING Functions', () => {
  describe('getProperCase()', () => {
    it(`should return the proper case of the inputted string`, () => {
      let propercaseContent = getProperCase('hello');
      expect(propercaseContent).toBe('Hello');
    });
  });

  describe('getEncodedUrl()', () => {
    it(`should return the encoded URL based on the inputted file information`, () => {
      let file: string = 'casdtfAAAAsssd';
      let fileType: string = 'image/png';
      let encoding: string = 'base64';
      let expectedUrl: string = `data:${fileType};${encoding},${file}`;

      let encodedUrl = getEncodedUrl(file, fileType, encoding);
      expect(encodedUrl).toBe(expectedUrl);
    });
  });

  describe('replacePlaceholder()', () => {
    it(`should replace the placeholder based on the given content`, () => {
      let stringContent = 'hello {{name}}';
      let replacedString = replacePlaceholder(stringContent, 'name', 'arrian');
      expect(replacedString).toBe(stringContent.replace('{{name}}', 'arrian'));
    });
  });

  describe('getEnumString()', () => {
    it(`should convert the enumeration value to string`, () => {
      enum TestEnum {
        None = 0,
        Success = 1
      }
      let stringEquivalent = getEnumString(TestEnum, TestEnum.Success);
      expect(stringEquivalent).toBe('Success');
    });
  });

  describe('getRecordCountLabel()', () => {
    it(`return empty string if count is 0`, () => {
      let recordCountLabel = getRecordCountLabel(0, 'Singular', 'Plural');
      expect(recordCountLabel).toBe('');
    });

    it(`return singular suffix if count is 1`, () => {
      let recordCountLabel = getRecordCountLabel(1, 'Singular', 'Plural');
      expect(recordCountLabel).toBe('1 Singular');
    });

    it(`return plural if count is greater than 1`, () => {
      let recordCountLabel = getRecordCountLabel(5, 'Singular', 'Plural');
      expect(recordCountLabel).toBe('5 Plural');
    });
  });

  describe('compareStrings()', () => {
    it(`return -1 if firstString < secondString`, () => {
      let result = compareStrings('Alpha', 'Beta');
      expect(result).toBe(-1);
    });

    it(`return 0 if firstString and secondString are the same`, () => {
      let result = compareStrings('Alpha', 'Alpha');
      expect(result).toBe(0);
    });

    it(`return 1 if firstString > secondString`, () => {
      let result = compareStrings('Beta', 'Alpha');
      expect(result).toBe(1);
    });
  });

  describe('containsString()', () => {
    it(`return true when source text contains target text.`, () => {
      let result = containsString('Something to check', 'check');
      expect(result).toBeTruthy();
    });

    it(`return false when source text does not contain target text.`, () => {
      let result = containsString('Something to check', 'hello');
      expect(result).toBeFalsy();
    });
  });
});
