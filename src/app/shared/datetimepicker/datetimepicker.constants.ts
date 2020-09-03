import { NgxMatDateFormats } from '@angular-material-components/datetime-picker';

export const MCS_DATE_FORMATS: NgxMatDateFormats = {
  parse: {
    dateInput: 'LL'
  },
  display: {
    dateInput: 'DD/MM/YYYY hh:mm A',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  }
};
export const DEFAULT_LOCALE = 'en-AU';
export const DEFAULT_TIMEZONE = 'Australia/Sydney';
export const DEFAULT_LABEL = 'Choose a date';
export const DEFAULT_DATE_FORMAT = 'DD/MM/YYYY';
export const DEFAULT_DATETIME_FORMAT = 'DD/MM/YYYY HH:mm';
export const DEFAULT_HOUR_STEP = 1;
export const DEFAULT_MIN_STEP = 1;
export const DEFAULT_SECOND_STEP = 1;
export const DEFAULT_FLOOR_TIME: [number, number] = [0, 0];
export const DEFAULT_CEIL_TIME: [number, number] = [23, 59];
export const DATETIMEZONE_CONVERTER_FORMAT = 'YYYY-MM-DD HH:mm';
