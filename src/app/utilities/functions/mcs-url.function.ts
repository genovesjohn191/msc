import { isNullOrEmpty } from './mcs-object.function';

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

/**
 * Returns the corresponding hostname from the given url
 * @param url Url to extract the hostname
 */
export function getHostName(url) {
  let match = url.match(/:\/\/(www[0-9]?\.)?(.[^/:]+)/i);

  if (!isNullOrEmpty(match) && match.length > 2
    && typeof match[2] === 'string'
    && match[2].length > 0) {
    return match[2];
  } else {
    return null;
  }
}

/**
 * Returns the domain name of the given url
 * @param url Url to extract the domain
 */
export function getDomainName(url) {
  let hostName = getHostName(url);
  let domain = hostName;

  // Check for local dev url and return it immediately
  let regExpression = new RegExp(/^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\.|$)){4}$/);
  if (regExpression.test(domain)) { return domain; }

  // Split url to get the actual domain i.e: macquariecloudservices
  if (!isNullOrEmpty(hostName)) {
    let parts = hostName.split('.').reverse();

    if (!isNullOrEmpty(parts) && parts.length > 1) {
      domain = parts[1] + '.' + parts[0];
      if (hostName.toLowerCase().indexOf('.co.uk') !== -1
        && parts.length > 2) {
        domain = parts[2] + '.' + domain;
      }
    }
  }
  return domain;
}
