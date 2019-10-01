import { Injectable } from '@angular/core';
import { McsDateTimeService } from '@app/core';
import { CommonDefinition, isNullOrEmpty, compareDates } from '@app/utilities';

const SYSTEM_MESSAGE_DATEFORMAT = 'YYYY-MM-DDTHH:mm';
const SYSTEM_MESSAGE_TIMEZONE_FORMAT = "yyyy-MM-dd'T'HH:mm z";
const SYSTEM_MESSAGE_ISO_DATEFORMAT = 'isoDate';
@Injectable()

export class SystemMessageFormService {

  constructor(private _dateTimeService: McsDateTimeService) { }

  /**
   * Returns the current date timezone
   */
  public get getDateNow(): string {
    return this.formatDateToISO(new Date());
  }

  /**
   * Formats the system message date to UTC
   * @param date Date to be serialize
   */
  public formatDateToUTC(date: string): string {
    if (isNullOrEmpty(date)) { return ''; }
    if (!isNaN(Date.parse(date))) {
      let datetime = this._dateTimeService.formatDateString(
        date,
        SYSTEM_MESSAGE_TIMEZONE_FORMAT,
        CommonDefinition.TIMEZONE_SYDNEY
      );
      return datetime;
    }
    return date;
  }

  /**
   * Format start and expiry to ISO Date
   * @param date Date to be serialize
   */
  public formatDateToISO(date: Date): string {
    if (isNullOrEmpty(date)) { return ''; }
    if (!isNaN(Date.parse(date.toLocaleDateString()))) {
      let datetime = this._dateTimeService.formatDate(
        date,
        SYSTEM_MESSAGE_ISO_DATEFORMAT,
        CommonDefinition.TIMEZONE_SYDNEY
      );
      return datetime;
    }
    return date.toLocaleDateString();
  }

  /**
   * Returns true when date format is valid
   * @param date Date that is validated
   */
  public validateDateFormat(date: string): boolean {
    return this._dateTimeService.isDateFormatValid(date, SYSTEM_MESSAGE_DATEFORMAT);
  }

  /**
   * Returns true when inputted date is greater than present date
   * @param date Inputted date of system message
   * @param presentDate Current Date Timezone
   */
  public isGreaterThanPresentDate(date: string, presentDate?: string): boolean {
    if (isNullOrEmpty(date)) { return false; }
    if (isNullOrEmpty(presentDate)) { presentDate = this.getDateNow; }

    let comparisonResult = compareDates(new Date(date), new Date(presentDate)) > 0;
    return comparisonResult;
  }

  /**
   * Returns true when passed all conditions for date validation
   * @param startDate Start date of system message
   * @param expiryDate Expiry date of system message
   * @param presentDate Current date timezone
   */
  public hasPassedDateValidation(startDate: string, expiryDate: string, presentDate?: string): boolean {
    if (isNullOrEmpty(expiryDate)) { return true; }
    if (isNullOrEmpty(startDate)) { startDate = this.getDateNow; }
    if (isNullOrEmpty(presentDate)) { presentDate = this.getDateNow; }

    let isStartLessExpiry = compareDates(new Date(startDate), new Date(expiryDate)) < 0;
    let isValidExpiry = this.isGreaterThanPresentDate(expiryDate, presentDate);

    return isStartLessExpiry && isValidExpiry;
  }

}
