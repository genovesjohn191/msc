import { Injectable } from '@angular/core';
import { formatDate } from '@angular/common';
import {
  isNullOrEmpty,
  convertDateTimezoneToUTC,
  isDateFormatValid,
  CommonDefinition
} from '@app/utilities';

import * as moment from 'moment-timezone';

export type McsDateTimeFormat = 'default' | 'short' | 'medium' | 'long' | 'full' |
  'dashShortDate' | 'shortDate' | 'mediumDate' | 'longDate' | 'fullDate' |
  'shortTime' | 'mediumTime' | 'longTime' | 'fullTime' | 'isoDate';

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
  public formatDate(date: Date, formatType: McsDateTimeFormat | string, timeZone?: string): string {
    if (isNullOrEmpty(date)) { return ''; }
    if (!isNullOrEmpty(timeZone)) {
      timeZone = moment(date).tz(timeZone).format('Z');
    }
    let actualFormat = isNullOrEmpty(formatType) ? 'default' : formatType;

    let formatFound = this._dateTimeMapTable.has(formatType as McsDateTimeFormat);
    if (formatFound) {
      actualFormat = this._dateTimeMapTable.get(formatType as McsDateTimeFormat);
    }
    return formatDate(date.toUTCString(), actualFormat, CommonDefinition.LOCALE, timeZone);
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
   * Creates the date time map table associated with the formatting
   */
  private _createDateTimeTable(): void {
    this._dateTimeMapTable.set('default', 'EEE, dd MMM yyyy, h:mm:ss a');
    this._dateTimeMapTable.set('short', 'd/M/yy, h:mm a');
    this._dateTimeMapTable.set('medium', 'd MMM, y, h:mm:ss a');
    this._dateTimeMapTable.set('long', 'd MMMM, y, h:mm:ss a z');
    this._dateTimeMapTable.set('full', 'EEEE, d MMMM, y, h:mm:ss a zzzz');
    this._dateTimeMapTable.set('shortDate', 'd/M/yy');
    this._dateTimeMapTable.set('mediumDate', 'd MMM, y');
    this._dateTimeMapTable.set('longDate', 'd MMMM, y');
    this._dateTimeMapTable.set('fullDate', 'EEEE, d MMMM, y');
    this._dateTimeMapTable.set('shortTime', 'h:mm a');
    this._dateTimeMapTable.set('mediumTime', 'h:mm:ss a');
    this._dateTimeMapTable.set('longTime', 'h:mm:ss a z');
    this._dateTimeMapTable.set('fullTime', 'h:mm:ss a zzzz');
    this._dateTimeMapTable.set('isoDate', 'yyyy-MM-ddTHH:mm');
  }
}
