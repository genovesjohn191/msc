import {
  compareNumbers,
  transformNumberToDecimal,
  minimizeByStepValue,
  maximizeByStepValue,
  currencyFormat,
  truncateDecimals
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

  describe('minimizeByStepValue()', () => {
    describe('given a number', () => {
      it(`should return minimum number based on step`, () => {
        let testNumber: number = 7;
        let testStep: number = 3;
        let result = minimizeByStepValue(testNumber, testStep);
        expect(result).toBe(6);
      });

      it(`should return minimum whole number based on step`, () => {
        let testNumber: number = 10.5;
        let testStep: number = 3;
        let result = minimizeByStepValue(testNumber, testStep);
        expect(result).toBe(9);
      });
    });
  });

  describe('maximizeByStepValue()', () => {
    describe('given a number', () => {
      it(`should return max number based on step`, () => {
        let testNumber: number = 7;
        let testStep: number = 3;
        let result = maximizeByStepValue(testNumber, testStep);
        expect(result).toBe(9);
      });

      it(`should return ceiled whole number based on step`, () => {
        let testNumber: number = 10.5;
        let testStep: number = 3;
        let result = maximizeByStepValue(testNumber, testStep);
        expect(result).toBe(12);
      });
    });
  });

  describe('currencyFormat()', () => {
    describe('given postive value', () => {
      it(`should return formatted result`, () => {
        let testNumber: number = 123456.12;
        let expected: string = '$123,456.12';
        let result = currencyFormat(testNumber);
        expect(result).toBe(expected);
      });
    });

    describe('given invalid input', () => {
      it(`should return $0.00`, () => {
        let testNumber: number;
        let expected: string = '$0.00';
        let result = currencyFormat(testNumber);
        expect(result).toBe(expected);
      });
    });

    describe('given negative value', () => {
      it(`should return formatted result`, () => {
        let testNumber: number = -1223.66;
        let expected: string = '-$1,223.66';
        let result = currencyFormat(testNumber);
        expect(result).toBe(expected);
      });
    });
  });

  describe('truncateDecimals()', () => {
    describe('given number with no decimals', () => {
      it(`should return result with no decimals`, () => {
        let testNumber: number = 100;
        let expected: number = 100;
        let result = truncateDecimals(testNumber, 2);
        expect(result).toBe(expected);
      });
    });

    describe('given number with decimals', () => {
      it(`should return fixed down version with no rounding`, () => {
        let testNumber: number = 100.157;
        let expected: number = 100.15;
        let result = truncateDecimals(testNumber, 2);
        expect(result).toBe(expected);
      });
    });

    describe('given number with less decimals than required', () => {
      it(`should return the the value with no change`, () => {
        let testNumber: number = 100.9;
        let expected: number = 100.9;
        let result = truncateDecimals(testNumber, 2);
        expect(result).toBe(expected);
      });
    });
  });
});
