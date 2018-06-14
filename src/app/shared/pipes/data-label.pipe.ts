import {
  Pipe,
  PipeTransform
} from '@angular/core';
import { isNullOrEmpty } from '../../utilities';

// Definition
const DEFAULT_UNAVAILABLE_DATA_LABEL = 'Unavailable';

@Pipe({
  name: 'mcsDataLabel'
})

export class DataLabelPipe implements PipeTransform {
  /**
   * Transform the given data to the provided label if it's null or empty
   * @param data Data to be converted
   * @param label Label to show instead if the data is null or empty
   */
  public transform(data: any, label: string = DEFAULT_UNAVAILABLE_DATA_LABEL): any {
    if (!isNullOrEmpty(data)) { return data; }

    // Return read-only span element
    return `<span class="read-only">${label}</span>`;
  }
}
