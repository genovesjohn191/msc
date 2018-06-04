import {
  Pipe,
  PipeTransform
} from '@angular/core';
import {
  isNullOrEmpty,
  formatDate
} from '../../utilities';

const DEFAULT_DATE_FORMAT = 'ddd, DD MMM YYYY, LT';

@Pipe({
  name: 'mcsStdDateFormat'
})

export class StdDateFormatPipe implements PipeTransform {
  /**
   * Converts the date into standard format if the custom format is not provided
   * @param date Date to be formatted
   * @param customFormat Custom format to be the basis of the formatting
   */
  public transform(date: Date, customFormat?: string): any {
    let dateFormat = isNullOrEmpty(customFormat) ? DEFAULT_DATE_FORMAT : customFormat;
    return isNullOrEmpty(date) ? '' : formatDate(date, dateFormat);
  }
}
