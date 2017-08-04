import { appendUnitSuffix } from './mcs-size.function';

describe('SIZE Functions', () => {
  describe('appendUnitSuffix()', () => {
    it(`should return the size value together with its unit as a string`, () => {
      let value = 250;
      let expectedString = '250 GB';
      let result = appendUnitSuffix(value, 'gigabyte');
      expect(result).toBe(expectedString);
    });
  });
});
