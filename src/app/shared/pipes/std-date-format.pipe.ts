import {
  Pipe,
  PipeTransform
} from '@angular/core';
import {
  McsDateTimeFormat,
  McsDateTimeService
} from '@app/core';

@Pipe({
  name: 'mcsStdDateFormat'
})

export class StdDateFormatPipe implements PipeTransform {

  constructor(private _dateTimeService: McsDateTimeService) { }

  /**
   * Converts the date into standard format if the custom format is not provided
   * @param date Date to be formatted
   * @param format Custom format to be the basis of the formatting
   */
  public transform(date: Date, format: McsDateTimeFormat = 'default', timeZone?: string, locale?: string): any {
    return this._dateTimeService.formatDate(date, format, timeZone, locale);
  }
}
