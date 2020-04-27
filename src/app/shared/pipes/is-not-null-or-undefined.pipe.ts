import {
  Pipe,
  PipeTransform
} from '@angular/core';
import { isNullOrUndefined } from '@app/utilities';

@Pipe({
  name: 'mcsIsNotNullOrUndefined'
})

export class IsNotNullOrUndefinedPipe implements PipeTransform {
  /**
   * Transform the given data into boolean type that returns true when the data is null or undefined
   * @param data Data to be transformed
   */
  public transform(data: any): boolean {
    return !isNullOrUndefined(data);
  }
}
