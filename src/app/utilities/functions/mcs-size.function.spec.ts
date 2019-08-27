import {
  convertMbToGb,
  convertGbToMb,
  convertKbToMb
} from './mcs-size.function';

describe('SIZE Functions', () => {

  describe('convertMbToGb()', () => {
    it(`should return the value converted to GB`, () => {
      let value = 1024;
      let expectedValue = 1;
      let result = convertMbToGb(value);
      expect(result).toBe(expectedValue);
    });
  });

  describe('convertGbToMb()', () => {
    it(`should return the value converted to MB`, () => {
      let value = 1;
      let expectedValue = 1024;
      let result = convertGbToMb(value);
      expect(result).toBe(expectedValue);
    });
  });

  describe('convertKbToMb()', () => {
    it(`should return the value converted to MB`, () => {
      let value = 1024;
      let expectedValue = 1;
      let result = convertKbToMb(value);
      expect(result).toBe(expectedValue);
    });
  });
});
