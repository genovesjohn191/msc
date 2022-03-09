import * as moment from 'moment-timezone';

import { formatDate } from '@angular/common';
import { Injectable } from '@angular/core';
import {
  containsString,
  convertDateTimezoneToUTC,
  isDateFormatValid,
  isNullOrEmpty
} from '@app/utilities';

export type McsDateTimeFormat = 'default' | 'short' | 'medium' | 'long' | 'full' |
  'dashShortDate' | 'shortDate' | 'mediumDate' | 'longDate' | 'fullDate' |
  'shortTime' | 'mediumTime' | 'longTime' | 'fullTime' | 'isoDate' | 'friendly' |
  'noYearDateShortTime' | 'longDateShortTime' | 'shortMonthYear' | 'fullMonthYear' |
  'shortDateTime' | 'tracksDateTime' | '24hourTime' | 'mediumNoMs';

@Injectable()
export class McsDateTimeService {
  private _dateTimeMapTable = new Map<McsDateTimeFormat, string>();

  constructor() {
    this._createDateTimeTable();
  }

  /**
   * Formats the date provided based on the format type
   * Returns empty string, when the date passed is null or empty
   * @param date Date to be formatted
   * @param formatType Format type to follow on the formatting
   * @param timeZone Timezone to be followed
   */
  public formatDate(date: Date, formatType: McsDateTimeFormat | string, timeZone?: string, locale?: string): string {
    if (isNullOrEmpty(date)) { return ''; }

    locale = isNullOrEmpty(locale) ? moment.locale() : locale;
    timeZone = isNullOrEmpty(timeZone) ? moment.tz.guess() : timeZone;

    moment.locale(locale);

    let actualFormat = isNullOrEmpty(formatType) ? 'default' : formatType;
    if (actualFormat === 'friendly') {
      return moment(date).fromNow().replace('a day ago', 'yesterday');
    }

    let formatFound = this._dateTimeMapTable.has(formatType as McsDateTimeFormat);
    if (formatFound) {
      actualFormat = this._dateTimeMapTable.get(formatType as McsDateTimeFormat);
    }

    let utcDateTime = moment.utc(date);
    let convertedDate = utcDateTime.clone().tz(timeZone);
    return convertedDate.format(actualFormat);
  }

  /**
   * Formats the date provided based on the format type
   * Returns empty string, when the date passed is null or empty
   * @param date Date to be formatted
   * @param formatType Format type to follow on the formatting
   * @param timeZone Timezone to be followed
   */
  public formatDateString(date: string, formatType: string, timeZone?: string): string {

    // Converts date to its timezone
    let dateTimetoTimezone = convertDateTimezoneToUTC(
      date,
      timeZone,
      formatType
    );
    return dateTimetoTimezone.toString();
  }

  /**
   * Validates the date time format based on the given date format
   * @param date date to validate
   * @param format format of the output date
   */
  public isDateFormatValid(date: string, format: string): boolean {
    return isDateFormatValid(date, format);
  }

  /**
   * Converts string time to date
   * @param time string to convert
   */
  public formatTimeStringToDate(time: string): Date {
    let timeArray = time.split(' ')[0].split(':');
    let date = new Date();
    let hours = Number(timeArray[0]);
    let minutes = Number(timeArray[1]);

    if(containsString(time.toUpperCase(), 'PM')){
      hours += 12;
    }
    else if(hours === 12){
      hours = 0;
    }

    date.setHours(hours);
    date.setMinutes(minutes);
    return date;
  }

  /**
   * Adds time to a specific date
   * @param date date to increment
   * @param minutes number of hours to add, default to 1
   */
  public addMinutesToDate(date: Date, minutes: number = 1): Date {
    let resultDate = new Date(date);
    resultDate.setMinutes(date.getMinutes() + minutes);
    return resultDate;
  }

  /**
   * Creates the date time map table associated with the formatting
   */
  private _createDateTimeTable(): void {
    this._dateTimeMapTable.set('default', 'ddd, DD MMM YYYY, h:mm:ss A');
    this._dateTimeMapTable.set('short', 'D/M/YY, h:mm A');
    this._dateTimeMapTable.set('medium', 'D MMM, y, h:mm:ss A');
    this._dateTimeMapTable.set('long', 'D MMMM, y, h:mm:ss A Z');
    this._dateTimeMapTable.set('full', 'dddd, D MMMM, y, h:mm:ss A ZZ');
    this._dateTimeMapTable.set('shortDate', 'D/M/yy');
    this._dateTimeMapTable.set('mediumDate', 'D MMM, y');
    this._dateTimeMapTable.set('longDate', 'D MMMM, y');
    this._dateTimeMapTable.set('fullDate', 'dddd, D MMMM, y');
    this._dateTimeMapTable.set('shortTime', 'h:mm A');
    this._dateTimeMapTable.set('mediumTime', 'h:mm:ss A');
    this._dateTimeMapTable.set('longTime', 'h:mm:ss A Z');
    this._dateTimeMapTable.set('fullTime', 'h:mm:ss A ZZ');
    this._dateTimeMapTable.set('24hourTime', 'HH:mm');
    this._dateTimeMapTable.set('isoDate', 'YYYY-MM-DD[T]HH:mm');
    this._dateTimeMapTable.set('noYearDateShortTime', 'ddd, DD MMM, h:mm A');
    this._dateTimeMapTable.set('longDateShortTime', 'ddd, DD MMM YYYY, h:mm A');
    this._dateTimeMapTable.set('shortMonthYear', 'MMM YYYY');
    this._dateTimeMapTable.set('fullMonthYear', 'MMMM YYYY');
    this._dateTimeMapTable.set('shortDateTime', 'YYYY-MM-DD');
    this._dateTimeMapTable.set('tracksDateTime', 'YYYY-MM-DD HH:mm:ss');
    this._dateTimeMapTable.set('mediumNoMs', 'D MMM, y, h:mm A');
  }
}
