import { McsUnitType } from '../core';
import {
  appendUnitSuffix,
  convertToGb,
  convertToMb
} from './mcs-size.function';

describe('SIZE Functions', () => {
  describe('appendUnitSuffix()', () => {
    it(`should return the size value together with its unit as a string`, () => {
      let value = 250;
      let expectedString = '250 GB';
      let result = appendUnitSuffix(value, McsUnitType.Gigabyte);
      expect(result).toBe(expectedString);
    });
  });

  describe('convertToGb()', () => {
    it(`should return the value converted to GB`, () => {
      let value = 1024;
      let expectedValue = 1;
      let result = convertToGb(value);
      expect(result).toBe(expectedValue);
    });
  });

  describe('convertToMB()', () => {
    it(`should return the value converted to MB`, () => {
      let value = 1;
      let expectedValue = 1024;
      let result = convertToMb(value);
      expect(result).toBe(expectedValue);
    });
  });
});
