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
