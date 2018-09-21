import {
  Pipe,
  PipeTransform
} from '@angular/core';
import { isNullOrEmpty } from '@app/utilities';

@Pipe({
  name: 'mcsIsNotNullOrEmpty'
})

export class IsNotNullOrEmptyPipe implements PipeTransform {
  /**
   * Transform the given data into boolean type that returns true when the data is null or empty
   * @param data Data to be transformed
   */
  public transform(data: any): boolean {
    return !isNullOrEmpty(data);
  }
}
