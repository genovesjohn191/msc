import {
  Pipe,
  PipeTransform
} from '@angular/core';
import { isNullOrEmpty } from '../../utilities';

@Pipe({
  name: 'mcsSortArray',
  pure: false
})

/**
 * Returns the sorted array based on the comparison method or comparator
 */
export class SortArrayPipe implements PipeTransform {

  public transform(records: any[], comparator?: (a: any, b: any) => number): any[] {
    if (isNullOrEmpty(records)) { return new Array(); }
    return records.sort(comparator);
  }
}
