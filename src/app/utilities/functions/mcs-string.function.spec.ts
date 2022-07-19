import { CommonDefinition } from '../common.definition';
import {
  getProperCase,
  getEncodedUrl,
  replacePlaceholder,
  getEnumString,
  getRecordCountLabel,
  compareStrings,
  containsString,
  convertSpacesToDash,
  formatStringToPhoneNumber,
  removeSpaces,
  formatStringToText,
  removeNonAlphaNumericChars,
  formatFirstLetterOfEachWordToUpperCase
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
    it(`should replace the placeholder if the given content is a string`, () => {
      let stringContent = 'hello {{name}}';
      let replacedString = replacePlaceholder(stringContent, 'name', 'arrian');
      expect(replacedString).toBe(stringContent.replace('{{name}}', 'arrian'));
    });
    it(`should replace the placeholder if the given content is an array of string`, () => {
      let stringContent = 'Hi I am {{name}}. {{age}} years old.';
      let replacedString = replacePlaceholder(stringContent, ['name', 'age'], ['arrian', '28']);
      let expectedValue = `Hi I am arrian. 28 years old.`;

      expect(replacedString).toBe(expectedValue);
    });
    it(`should return undefined if fullstring is empty`, () => {
      let stringContent = '';
      let replacedString = replacePlaceholder(stringContent, 'name', 'arrian');
      expect(replacedString).toBe(undefined);
    });
    it(`should return undefined if fullstring is null`, () => {
      let stringContent = null;
      let replacedString = replacePlaceholder(stringContent, 'name', 'arrian');
      expect(replacedString).toBe(undefined);
    });
    it(`should return undefined if fullstring is undefined`, () => {
      let stringContent = undefined;
      let replacedString = replacePlaceholder(stringContent, 'name', 'arrian');
      expect(replacedString).toBe(undefined);
    });
    it(`should throw an error if placeholder names and values length are not the same`, () => {
      let stringContent = 'Hi I am {{name}}. {{age}} years old.';
      expect(
        () => { replacePlaceholder(stringContent, ['name'], ['arrian', '28']); }
      ).toThrow(new Error('Count of placeholders and values are not the same'));
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
    it(`should return empty string if count is 0`, () => {
      let recordCountLabel = getRecordCountLabel(0, 'Singular', 'Plural');
      expect(recordCountLabel).toBe('');
    });

    it(`should return singular suffix if count is 1`, () => {
      let recordCountLabel = getRecordCountLabel(1, 'Singular', 'Plural');
      expect(recordCountLabel).toBe('1 Singular');
    });

    it(`should return plural if count is greater than 1`, () => {
      let recordCountLabel = getRecordCountLabel(5, 'Singular', 'Plural');
      expect(recordCountLabel).toBe('5 Plural');
    });
  });

  describe('compareStrings()', () => {
    it(`should return -1 if firstString < secondString`, () => {
      let result = compareStrings('Alpha', 'Beta');
      expect(result).toBe(-1);
    });

    it(`should return 0 if firstString and secondString are the same`, () => {
      let result = compareStrings('Alpha', 'Alpha');
      expect(result).toBe(0);
    });

    it(`should return 1 if firstString > secondString`, () => {
      let result = compareStrings('Beta', 'Alpha');
      expect(result).toBe(1);
    });
    it(`should return 0 if firstString and secondString is empty`, () => {
      let result = compareStrings(null, '');
      expect(result).toBe(0);
    });
  });

  describe('containsString()', () => {
    it(`should return true when source text contains target text.`, () => {
      let result = containsString('Something to check', 'check');
      expect(result).toBeTruthy();
    });

    it(`should return false when source text does not contain target text.`, () => {
      let result = containsString('Something to check', 'hello');
      expect(result).toBeFalsy();
    });
  });

  describe('convertSpacesToDash()', () => {
    it(`should return the converted string spaces into dash.`, () => {
      let result = convertSpacesToDash('Something to check');
      expect(result).toEqual('something-to-check');
    });
  });

  describe('removeSpaces()', () => {
    it(`should return the converted string without spaces.`, () => {
      let result = removeSpaces(' Something to check ');
      expect(result).toEqual('Somethingtocheck');
    });
  });

  describe('removeNonAlphaNumericChars()', () => {
    it(`should return the converted string without without spaces and non-alphanumeric characters.`, () => {
      let result = removeNonAlphaNumericChars(' Something%to% check %@42564');
      expect(result).toEqual('Somethingtocheck42564');
    });
  });

  describe('formatStringToText()', () => {
    it(`should return the converted string to text without tab.`, () => {
      let result = formatStringToText('test	test');
      expect(result).toEqual('test test');
    });
  });

  describe('formatStringToPhoneNumber()', () => {

    describe('given valid number string and no custom regex', () => {
      it(`should format the string to default phone number format`, () => {
        let result = formatStringToPhoneNumber('1111222333');
        expect(result).toEqual('1111 222 333');
      });
    });

    describe('given valid number string and custom regex flag removal set to true', () => {
      it(`should remove country code with plus sign`, () => {
        let sampleRegExp = CommonDefinition.REGEX_MOBILE_NUMBER_PATTERN;
        let result = formatStringToPhoneNumber('+61400000000',sampleRegExp, true);
        expect(result).toEqual('1400000000');
      });

      it(`should remove country codes`, () => {
        let sampleRegExp = CommonDefinition.REGEX_MOBILE_NUMBER_PATTERN;
        let result = formatStringToPhoneNumber('61400000000',sampleRegExp, true);
        expect(result).toEqual('1400000000');
      });


      it(`should return exact 10 digit mobile number`, () => {
        let sampleRegExp = CommonDefinition.REGEX_MOBILE_NUMBER_PATTERN;
        let result = formatStringToPhoneNumber('0400000000',sampleRegExp, true);
        expect(result).toEqual('0400000000');
      });
    });

    describe('given valid number string and custom regex flag removal set to false', () => {

      it(`should return mobile number wihout plus sign`, () => {
        let sampleRegExp = CommonDefinition.REGEX_MOBILE_NUMBER_PATTERN;
        let result = formatStringToPhoneNumber('+61400000000',sampleRegExp, false);
        expect(result).toEqual('61400000000');
      });

      it(`should return complete mobile number`, () => {
        let sampleRegExp = CommonDefinition.REGEX_MOBILE_NUMBER_PATTERN;
        let result = formatStringToPhoneNumber('61400000000',sampleRegExp, false);
        expect(result).toEqual('61400000000');
      });

      it(`should return 10 digit mobile number`, () => {
        let sampleRegExp = CommonDefinition.REGEX_MOBILE_NUMBER_PATTERN;
        let result = formatStringToPhoneNumber('0400000000',sampleRegExp, false);
        expect(result).toEqual('0400000000');
      });
    });

    describe('given invalid number string', () => {
      it(`should return null`, () => {
        let sampleRegExp = CommonDefinition.REGEX_MOBILE_NUMBER_PATTERN;
        let nullScenario = formatStringToPhoneNumber(null,sampleRegExp, true);
        let undefinedScenario = formatStringToPhoneNumber(undefined,sampleRegExp, true);
        let emptyScenario = formatStringToPhoneNumber('',sampleRegExp, true);
        let invalidScanario = formatStringToPhoneNumber('test',sampleRegExp, true);
        expect(invalidScanario).toBeNull();
        expect(emptyScenario).toBeNull();
        expect(undefinedScenario).toBeNull();
        expect(nullScenario).toBeNull();
      });
    });

  });
  
  describe('formatFirstLetterOfEachWordToUpperCase()', () => {
    it(`should convert the first letter of each word to upper case`, () => {
      let result = formatFirstLetterOfEachWordToUpperCase('hello world. welcome.');
      expect(result).toEqual('Hello World. Welcome.');
    });
  });
});
