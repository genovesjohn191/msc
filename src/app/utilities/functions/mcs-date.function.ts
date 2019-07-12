let moment = require('moment');
let momenttz = require('moment-timezone');

/**
 * @deprecated Use the service instead for common implementation
 */
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
 * Formats the time with specific timezone, uses moment-timezone JS
 * @deprecated Use the service instead for common implementation
 * @param date date to convert
 * @param timezone specific timezone of the date
 * @param format desired format of the output date
 * TODO : we can replace this by the moment based angular formatDate
 */
export function formatDateTimeZone(date: Date, timezone: string, format: string): string {
  let formattedDate: string = '';

  // Format date based on formatting string
  if (date) {
    formattedDate = momenttz(date.toUTCString()).tz(timezone).format(format);
  }

  // return the formatted date using moment
  return formattedDate;
}

/**
 * Formats the time to UTC timezone, uses moment-timezone JS
 * @deprecated Use the service instead for common implementation
 * @param date date to convert
 * @param timezone specific timezone of the date
 * @param format desired format of the output date
 * TODO : we can replace this by the moment based angular formatDate
 */
export function formatDateToUTC(date: string, timezone: string, format: string): string {
    let localDateTime = moment(new Date(date).toISOString()).format(format);
    let formattedDate =  moment.tz(localDateTime,timezone).format();
    return moment(formattedDate).utc().format();
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
 * Return expiration label based on the provided expiry date
 * Expires = if not yet expired
 * Expired = if expired
 * @param expiry Expiry date
 */
export function getExpiryLabel(expiry: Date) {
  let label: string = '';
  if (expiry) {
    label = (compareDates(expiry, new Date()) >= 0) ? 'Expires' : 'Expired';
  }
  return label;
}

/**
 * Converts time with supplied formats, uses moment JS
 * @param time time to convert
 * @param inputFormat format of the input
 * @param outputFomat desired format of the output, default to 24HR format (HH:mm)
 */
export function formatTime(
  time: string,
  inputFormat: string,
  outputFomat: string = 'HH:mm'
): string {
  let convertedTime: string = '';
  if (time) {
    convertedTime = moment(time, inputFormat).format(outputFomat);
  }
  return convertedTime;
}
