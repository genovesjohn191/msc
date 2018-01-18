import { compareNumbers } from './mcs-number.function';

describe('NUMBER Functions', () => {
  describe('compareNumbers()', () => {
    it(`return -1 if firstNumber < secondNumber`, () => {
      let result = compareNumbers(1, 2);
      expect(result).toBe(-1);
    });

    it(`return 0 if firstNumber and secondNumber are the same`, () => {
      let result = compareNumbers(2, 2);
      expect(result).toBe(0);
    });

    it(`return 1 if firstNumber > secondNumber`, () => {
      let result = compareNumbers(2, 1);
      expect(result).toBe(1);
    });
  });
});
