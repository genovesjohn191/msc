import {
  Pipe,
  PipeTransform
} from '@angular/core';
import { replacePlaceholder } from '../../utilities';
import { isNullOrUndefined } from 'util';

@Pipe({
  name: 'mcsTextPlaceholder'
})

export class TextPlaceholderPipe implements PipeTransform {
  /**
   * Returns the corresponding placeholder for the text content
   * @param textContent Text content to be tranform
   * @param placeHolder Placeholder to be converted
   * @param value Corresponding value of the placeholder
   */
  public transform(textContent: string, placeHolder: string, value: any): any {
    if (isNullOrUndefined(value)) { value = ''; }
    return replacePlaceholder(textContent, String(placeHolder), String(value));
  }
}
