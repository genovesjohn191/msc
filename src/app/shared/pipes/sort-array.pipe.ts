import {
  Pipe,
  PipeTransform
} from '@angular/core';
import { isNullOrEmpty } from '../../utilities';

@Pipe({
  name: 'mcsSortArray'
})

/**
 * Returns the sorted array based on the comparison method or comparator
 */
export class SortArrayPipe implements PipeTransform {
  /**
   * Transforms the given record into a sorted list
   * @param records Records to be sorted
   * @param comparator Comparison method for sorting
   */
  public transform<T>(records: T[], comparator?: (a: T, b: T) => number): T[] {
    if (isNullOrEmpty(records)) { return new Array<T>(); }
    return records.sort(comparator);
  }
}
