import {
  compareNumbers,
  transformNumberToDecimal
} from './mcs-number.function';

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

  describe('transformNumberToDecimal()', () => {
    describe('given a decimal number', () => {
      it(`should return rounded-up formatted string`, () => {
        let testNumber: number = 5.3884;
        let result = transformNumberToDecimal(testNumber, 2);
        expect(result).toBe('5.39');
      });
      it(`should return rounded-down formatted string`, () => {
        let testNumber: number = 2.3824;
        let result = transformNumberToDecimal(testNumber, 2);
        expect(result).toBe('2.38');
      });
    });
    describe('given a whole number', () => {
      it(`should return decimal formatted string`, () => {
        let testNumber: number = 5;
        let result = transformNumberToDecimal(testNumber, 2);
        expect(result).toBe('5.00');
      });
    });
  });
});
