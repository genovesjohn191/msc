import {
  Pipe,
  PipeTransform
} from '@angular/core';
import { isNullOrEmpty } from '../../utilities';

@Pipe({
  name: 'mcsDataLabel'
})

export class DataLabelPipe implements PipeTransform {

  /**
   * Transform the given data to the provided label if it's null or empty
   * @param data Data to be converted
   * @param label Label to show instead if the data is null or empty
   */
  public transform(data: any, label: string): string {
    return isNullOrEmpty(data) ? label : data;
  }
}
