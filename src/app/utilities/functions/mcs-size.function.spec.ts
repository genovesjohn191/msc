import { UnitType } from '@app/models';
import {
  appendUnitSuffix,
  convertMbToGb,
  convertGbToMb,
  convertKbToMb
} from './mcs-size.function';

describe('SIZE Functions', () => {
  describe('appendUnitSuffix()', () => {
    it(`should return the size value together with its unit as a string`, () => {
      let value = 250;
      let expectedString = '250 GB';
      let result = appendUnitSuffix(value, UnitType.Gigabyte);
      expect(result).toBe(expectedString);
    });
  });

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
