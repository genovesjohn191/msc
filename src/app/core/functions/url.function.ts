/**
 * Valid URL Checker
 * @param url URL string
 * @return TRUE: valid, FALSE: not valid
 */
export function isUrlValid(url: string): boolean {
  let urlValidFlag: boolean = false;
  let urlRegExp: string;
  let regExpResult: any;

  // Set Regex URL Pattern
  urlRegExp = `(http(s)?:\/\/.)?(www\.)
    ?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z‌​]{2,6}\b([-a-zA-Z0-9‌​@:%_\+.~#?&=]*)`;
  // Match Regex
  regExpResult = url.match(urlRegExp);
  if (regExpResult) {
    urlValidFlag = true;
  } else {
    urlValidFlag = false;
  }
  // Return url valid flag
  return urlValidFlag;
}
