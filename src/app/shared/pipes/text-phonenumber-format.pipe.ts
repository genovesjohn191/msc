import {
    Pipe,
    PipeTransform
} from '@angular/core';
import {
    isNullOrEmpty,
    formatStringToPhoneNumber
} from '@app/utilities';

@Pipe({
    name: 'mcsPhoneNumberFormat'
})
export class TextPhoneNumberFormatPipe implements PipeTransform {
    /**
     * Formats specific string to phone number format
     * @param numberString string to be formatted
     * @param customFormatRegex (optional) regex to be used for phone number formatting
     */
    public transform(numberString: string, customFormatRegex: RegExp): string {
      return formatStringToPhoneNumber(numberString, customFormatRegex);
    }
  }
