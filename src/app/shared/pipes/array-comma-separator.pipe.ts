import {
  Pipe,
  PipeTransform
} from '@angular/core';
import { isNullOrEmpty } from '@app/utilities';

@Pipe({
  name: 'mcsArrayCommaSeparator'
})

export class ArrayCommaSeparatorPipe implements PipeTransform {

  /**
   * Transforms the source array into comma separated
   * @param sourceArray Source array to be transformed
   */
  public transform(sourceArray: any[]): string {
    let filteredArray = isNullOrEmpty(sourceArray) ? [] :
      sourceArray.filter((record) => !isNullOrEmpty(record));
    return filteredArray.join(', ');
  }
}
