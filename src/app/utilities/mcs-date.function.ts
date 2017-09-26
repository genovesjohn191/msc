let moment = require('moment');

export function formatDate(date: Date, format: string): string {
  let formattedDate: string = '';

  // Format date based on formatting string
  if (date) {
    formattedDate = moment(date.toUTCString()).format(format);
  }

  // return the formatted date using moment
  return formattedDate;
}

/**
 * Get or calculate time difference in milliseconds
 * @param firstDate First date
 * @param secondDate Second date to be compare in first date
 */
export function getTimeDifference(firstDate: Date, secondDate: Date): number {
  // Initialize for undefined/null input variables
  if (!firstDate) { firstDate = new Date(); }
  if (!secondDate) { secondDate = new Date(); }

  // Calculate the time difference using math functions
  let timeDifference = Math.abs(secondDate.getTime() - firstDate.getTime());
  return timeDifference;
}

/**
 * Get or calculate day difference using the give dates
 * @param firstDate First date
 * @param secondDate Second date to be compare in first date
 */
export function getDayDifference(firstDate: Date, secondDate: Date): number {
  // Calculate time difference using milliseconds, hours, minutes, seconds
  return (Math.ceil(getTimeDifference(firstDate, secondDate) / (1000 * 24 * 60 * 60)));
}

/**
 * Compare 2 dates and return the corresponding comparison value
 * 1 = First date is newer than second date
 * 0 = Both dates are the same
 * -1 = First date is older than second date
 * @param firstDate First date to be compare
 * @param secondDate Second date to be serve as basis
 */
export function compareDates(firstDate: Date, secondDate: Date): number {
  // Initialize for undefined/null input variables
  if (!firstDate) { firstDate = new Date(); }
  if (!secondDate) { secondDate = new Date(); }

  let compareValues: number = 0;
  let firstTime = firstDate.getTime();
  let secondTime = secondDate.getTime();

  if (firstTime < secondTime) {
    compareValues = -1;
  } else if (firstTime > secondTime) {
    compareValues = 1;
  } else {
    compareValues = 0;
  }
  return compareValues;
}

/**
 * Convert Date to standard string based on FUSION standard
 *
 * `@Note:` This conversion is common accross the project
 * @param date Date to be converted
 */
export function convertDateToStandardString(date: Date) {
  let convertedString: string = '';
  if (date) {
    convertedString = formatDate(date, 'LTS, ddd DD MMM, YYYY');
  }
  return convertedString;
}

/**
 * Return expiration label based on the provided expiry date
 * Expires = if not yet expired
 * Expired = if expired
 * @param expiry Expiry date
 */
export function getExpiryLabel(expiry: Date) {
  let label: string = '';
  if (expiry) {
    label = (compareDates(expiry, new Date()) >= 0) ? 'Expires' : 'Expired' ;
  }
  return label;
}
