import {
  Pipe,
  PipeTransform
} from '@angular/core';
import { isNullOrEmpty } from '@app/utilities';

const DEFAULT_ARRAY_MAX = 10;

@Pipe({
  name: 'mcsArrayTakeMax'
})

export class ArrayTakeMaxPipe implements PipeTransform {

  /**
   * Transforms the source array and slice the records based on the given max size
   * @param sourceArray Source array to be transformed
   * @param customMaxSize Custom maximum size
   */
  public transform(sourceArray: any[], customMaxSize?: number): any[] {
    let maxArray = isNullOrEmpty(customMaxSize) ? DEFAULT_ARRAY_MAX : customMaxSize;
    return isNullOrEmpty(sourceArray) ? new Array() : sourceArray.slice(0, maxArray);
  }
}
