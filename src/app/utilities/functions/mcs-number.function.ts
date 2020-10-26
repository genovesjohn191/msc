import { isNullOrEmpty } from './mcs-object.function';

/**
 * Compare 2 numbers and return the corresponding comparison value
 * 1 = First number is greater than second number
 * 0 = Both numbers are the same
 * -1 = First number is less than second number
 * @param firstDate First number to be compare
 * @param secondDate Second number to be serve as basis
 */
export function compareNumbers(firstNumber: number, secondNumber: number): number {
  // Comparison value
  let compareValues: number = 0;
  if (firstNumber < secondNumber) {
    compareValues = -1;
  } else if (firstNumber > secondNumber) {
    compareValues = 1;
  } else {
    compareValues = 0;
  }
  return compareValues;
}

/**
 * Gets the random value between number
 * @param minValue Minimum value of the number
 * @param maxValue Maximum value of the number
 */
export function getRandomNumber(minValue: number, maxValue: number): number {
  return Math.random() * (maxValue - minValue) + minValue;
}

/**
 * Transform a number to a string formatted value with the desired decimal place
 * @param numberToTransform number to transform
 */
export function transformNumberToDecimal(numberToTransform: number, decimalPlaces: number): string {
  return numberToTransform.toFixed(2);
}

/**
 * Returns the nearest number less or equal to the provided number based on the step/divisor
 * @param value number to get the min value
 * @param step step or the divisor where the number provided be divisible of
 */
export function minimizeByStepValue(value: number, step: number): number {
  return Math.floor(value / step) * step;
}

/**
 * Returns the nearest number greater or equal to the provided number based on the step/divisor
 * @param value number to get the max value
 * @param step step or the divisor where the number provided be divisible of
 */
export function maximizeByStepValue(value: number, step: number): number {
  return Math.ceil(value / step) * step;
}

/**
 * Returns a currency format in USD e.g. $4,500.20
 * @param value The number to format
 */
export function currencyFormat(value: number): string {
  if (isNullOrEmpty(value)) {
    return '$0.00';
  }

  let formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  });

  return formatter.format(value);
}
