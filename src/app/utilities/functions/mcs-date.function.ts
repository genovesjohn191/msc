import { isNullOrEmpty } from './mcs-object.function';

let luxon = require('luxon');
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
 * Converts the time to timezone, uses moment-timezone JS
 * @param date date to convert
 * @param timezone specific timezone of the date
 * @param format desired format of the output date
 * TODO : we can separate the timezone and formatting to UTC,
 * consider replacing luxon with moment timezone to decrease dependencies
 */
export function convertDateTimezoneToUTC(date: string, timezone: string, format: string): any {
  let dateTime = luxon.DateTime;
  let convertedTimezone = dateTime.fromFormat(date + ' ' + timezone, format, {
    setZone: true
  });
  let formattedDate = convertedTimezone.setZone('UTC', { keepLocalTime: false });
  return formattedDate;
}

/**
 * Checks if the date format is the same with the given format
 * @param date date to convert
 * @param format desired format of the output date
 */
export function isDateFormatValid(date: string, format: string): boolean {
  let dateFormat = moment(date, format);
  return dateFormat.isValid();
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
 * Returns a friendly timespan e.g. 4d 6h
 * @param milleseconds timespan in milleseconds
 */
export function getFriendlyTimespan(milleseconds: number): string {
  if (isNullOrEmpty(milleseconds) || milleseconds < 0) {
    return '';
  }
  if (milleseconds > 0 && milleseconds < 1000) {
    return '1s';
  }

  let timespan: number = Math.floor(milleseconds * 0.001);
  let days = 0;
  let hours = 0;
  let mins = 0;
  let secs = 0;

  // Calculate for days
  if (timespan >= 86400) {
    days = Math.floor(timespan / 86400);
    timespan = timespan - (days * 86400);
  }
  // Calculate for hours
  if (timespan >= 3600) {
    hours = Math.floor(timespan / 3600);
    timespan = timespan - (hours * 3600);
  }
  // Calculate for mins
  if (timespan >= 60) {
    mins = Math.floor(timespan / 60);
    secs = timespan - (mins * 60);
  } else {
    secs = timespan;
  }

  let friendlyTimespan = '';
  if (days > 0) { friendlyTimespan = `${days}d ` }
  if (hours > 0) { friendlyTimespan = `${friendlyTimespan}${hours}h ` }
  if (mins > 0 && days === 0) { friendlyTimespan = `${friendlyTimespan}${mins}m ` }
  if (secs > 0 && hours === 0) { friendlyTimespan = `${friendlyTimespan}${secs}s ` }
  return friendlyTimespan.trim();
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

/**
 * Gets the current date
 */
export function getCurrentDate(): Date {
  return new Date();
}

/**
 * Gets the day in month of a specific date, if none is specified would return the current day in month
 * @param date date to get day in month
 */
export function getDayinMonth(date: Date = new Date()): number {
  return date.getDate();
}

/**
 * Gets the month of a specific date, if none is specified would return the current month
 * @param date date to get month
 */
export function getMonth(date: Date = new Date()): number {
  return date.getMonth() + 1; // zero based
}

/**
 * Gets the year of a specific date, if none is specified would return the current year
 * @param date date to get year
 */
export function getYear(date: Date = new Date()): number {
  return date.getFullYear();
}

/**
 * Gets the first date of the week (Sunday)
 */
export function getFirstDateOfTheWeek(date: Date = new Date()): number {
  return date.getDate() - date.getDay();
}

/**
 * Gets the first date of the current month
 */
export function getFirstDateOfTheMonth(date: Date = new Date()): number {
  return date.getFullYear(), date.getMonth(), 1;
}

/**
 * Gets the first date of the current year
 */
export function getFirstDateOfTheYear(date: Date = new Date()): Date {
  return new Date(date.getFullYear(), 0, 1);
}

/**
 * Gets the last date of the previous year
 */
export function getLastDateOfThePreviousYear(date: Date = new Date()): Date {
  return new Date(date.getFullYear() - 1, 11, 31);
}

/**
 * Adds time to a specific date
 * @param date date to increment
 * @param hours number of hours to add, default to 1
 */
export function addHoursToDate(date: Date, hours: number = 1): Date {
  let resultDate = new Date(date);
  resultDate.setHours(date.getHours() + hours);
  return resultDate;
}


/**
 * Adds day to a specific date
 * @param date date to increment
 * @param days number of days to add, default to 1
 */
export function addDaysToDate(date: Date, days: number = 1): Date {
  let resultDate = new Date(date);
  resultDate.setDate(date.getDate() + days);
  return resultDate;
}

/**
 * Adds months to a specific date
 * @param date date to increment
 * @param months number of months to add, default to 1
 */
export function addMonthsToDate(date: Date, months: number = 1): Date {
  let resultDate = new Date(date);
  resultDate.setMonth(date.getMonth() + months);
  return resultDate;
}

/**
 * Returns the date only from the given input excluding the time settings
 */
export function getDateOnly(date: Date | string): Date {
  let actualDate =  (date instanceof Date) ? date : new Date(date);
  actualDate.setSeconds(0);
  actualDate.setMinutes(0);
  actualDate.setHours(0);
  return actualDate;
}

/**
 * Gets timestamp in seconds
 */
export function getTimestamp(date: Date | string): number {
  let actualDate =  (date instanceof Date) ? date : new Date(date);
  return actualDate?.getTime();
}
