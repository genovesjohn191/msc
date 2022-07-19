import {
  convertMbToGb,
  convertGbToMb,
  convertKbToMb,
  convertMbitToGbit,
  convertGbitToMbit
} from './mcs-size.function';

describe('SIZE Functions', () => {

  describe('convertMbToGb()', () => {
    it(`should return the MB value converted to GB if value is whole number`, () => {
      let value = 1024;
      let expectedValue = 1;
      let result = convertMbToGb(value);
      expect(result).toBe(expectedValue);
    });
    it(`should return the MB value converted to GB if value is 0`, () => {
      let value = 0;
      let expectedValue = 0;
      let result = convertMbToGb(value);
      expect(result).toBe(expectedValue);
    });
    it(`should return the MB value converted to GB if value is null`, () => {
      let value = null;
      let expectedValue = 0;
      let result = convertMbToGb(value);
      expect(result).toBe(expectedValue);
    });
    it(`should return the MB value converted to GB if value is undefined`, () => {
      let value = undefined;
      let expectedValue = 0;
      let result = convertMbToGb(value);
      expect(result).toBe(expectedValue);
    });
    it(`should return the MB value converted to GB if value is negative number`, () => {
      let value = -1024;
      let expectedValue = -1;
      let result = convertMbToGb(value);
      expect(result).toBe(expectedValue);
    });
    it(`should return the MB value converted to GB if value is decimal number`, () => {
      let value = 102.5;
      let expectedValue = 0.10009765625;
      let result = convertMbToGb(value);
      expect(result).toBe(expectedValue);
    });
  });

  describe('convertGbToMb()', () => {
    it(`should return the GB value converted to MB if value is whole number`, () => {
      let value = 1;
      let expectedValue = 1024;
      let result = convertGbToMb(value);
      expect(result).toBe(expectedValue);
    });
    it(`should return the GB value converted to MB if value is 0`, () => {
      let value = 0;
      let expectedValue = 0;
      let result = convertGbToMb(value);
      expect(result).toBe(expectedValue);
    });
    it(`should return the GB value converted to MB if value is null`, () => {
      let value = 0;
      let expectedValue = 0;
      let result = convertGbToMb(value);
      expect(result).toBe(expectedValue);
    });
    it(`should return the GB value converted to MB if value is undefined`, () => {
      let value = 0;
      let expectedValue = 0;
      let result = convertGbToMb(value);
      expect(result).toBe(expectedValue);
    });
    it(`should return the GB value converted to MB if value is negative number`, () => {
      let value = -1;
      let expectedValue = -1024;
      let result = convertGbToMb(value);
      expect(result).toBe(expectedValue);
    });
    it(`should return the GB value converted to MB if value is decimal number`, () => {
      let value = 1.4;
      let expectedValue = 1433.6;
      let result = convertGbToMb(value);
      expect(result).toBe(expectedValue);
    });
  });

  describe('convertKbToMb()', () => {
    it(`should return the KB value converted to MB if value is whole number`, () => {
      let value = 1024;
      let expectedValue = 1;
      let result = convertKbToMb(value);
      expect(result).toBe(expectedValue);
    });
    it(`should return the KB value converted to MB if value is 0`, () => {
      let value = 0;
      let expectedValue = 0;
      let result = convertKbToMb(value);
      expect(result).toBe(expectedValue);
    });
    it(`should return the KB value converted to MB if value is null`, () => {
      let value = 0;
      let expectedValue = 0;
      let result = convertKbToMb(value);
      expect(result).toBe(expectedValue);
    });
    it(`should return the KB value converted to MB if value is undefined`, () => {
      let value = 0;
      let expectedValue = 0;
      let result = convertKbToMb(value);
      expect(result).toBe(expectedValue);
    });
    it(`should return the KB value converted to MB if value is negative number`, () => {
      let value = -1024;
      let expectedValue = -1;
      let result = convertKbToMb(value);
      expect(result).toBe(expectedValue);
    });
    it(`should return the KB value converted to MB if value is decimal number`, () => {
      let value = 102.5;
      let expectedValue = 0.10009765625;
      let result = convertKbToMb(value);
      expect(result).toBe(expectedValue);
    });
  });

  describe('convertMbitToGbit()', () => {
    it(`should return the MBit value converted to GBit if value is whole number`, () => {
      let value = 1000;
      let expectedValue = 1;
      let result = convertMbitToGbit(value);
      expect(result).toBe(expectedValue);
    });
    it(`should return the MBit value converted to GBit if value is 0`, () => {
      let value = 0;
      let expectedValue = 0;
      let result = convertMbitToGbit(value);
      expect(result).toBe(expectedValue);
    });
    it(`should return the MBit value converted to GBit if value is null`, () => {
      let value = 0;
      let expectedValue = 0;
      let result = convertMbitToGbit(value);
      expect(result).toBe(expectedValue);
    });
    it(`should return the MBit value converted to GBit if value is undefined`, () => {
      let value = 0;
      let expectedValue = 0;
      let result = convertMbitToGbit(value);
      expect(result).toBe(expectedValue);
    });
    it(`should return the MBit value converted to GBit if value is negative number`, () => {
      let value = -50;
      let expectedValue = -0.05;
      let result = convertMbitToGbit(value);
      expect(result).toBe(expectedValue);
    });
    it(`should return the MBit value converted to GBit if value is decimal number`, () => {
      let value = 25.5;
      let expectedValue = 0.0255;
      let result = convertMbitToGbit(value);
      expect(result).toBe(expectedValue);
    });
  });

  describe('convertGbitToMbit()', () => {
    it(`should return the GBit value converted to MBit if value is whole number`, () => {
      let value = 1;
      let expectedValue = 1000;
      let result = convertGbitToMbit(value);
      expect(result).toBe(expectedValue);
    });
    it(`should return the GBit value converted to MBit if value is 0`, () => {
      let value = 0;
      let expectedValue = 0;
      let result = convertGbitToMbit(value);
      expect(result).toBe(expectedValue);
    });
    it(`should return the GBit value converted to MBit if value is null`, () => {
      let value = 0;
      let expectedValue = 0;
      let result = convertGbitToMbit(value);
      expect(result).toBe(expectedValue);
    });
    it(`should return the GBit value converted to MBit if value is undefined`, () => {
      let value = 0;
      let expectedValue = 0;
      let result = convertGbitToMbit(value);
      expect(result).toBe(expectedValue);
    });
    it(`should return the GBit value converted to MBit if value is negative number`, () => {
      let value = -5;
      let expectedValue = -5000;
      let result = convertGbitToMbit(value);
      expect(result).toBe(expectedValue);
    });
    it(`should return the GBit value converted to MBit if value is decimal number`, () => {
      let value = 2.5;
      let expectedValue = 2500;
      let result = convertGbitToMbit(value);
      expect(result).toBe(expectedValue);
    });
  });
});
