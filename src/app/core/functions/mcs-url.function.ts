/**
 * Valid URL Checker
 * @param url URL string
 * @return TRUE: valid, FALSE: not valid
 */
export function isUrlValid(url: string): boolean {
  let regExpResult: any;

  // Initialize regular expression
  let regExpression = new RegExp(
    /^((https?):\/\/)?([w|W]{3}\.)+[a-zA-Z0-9\-\.]{3,}\.[a-zA-Z]{2,}(\.[a-zA-Z]{2,})?$/
  );

  // Match Regex
  regExpResult = regExpression.test(url);

  // Return url valid flag
  return regExpResult;
}
