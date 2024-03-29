import {
  Pipe,
  PipeTransform
} from '@angular/core';
import { McsKeyValuePair } from '@app/models';
import { isNullOrEmpty } from '@app/utilities';

@Pipe({
  name: 'mcsMapIterable'
})

/**
 * Returns the following values of the iterable map
 * @description key as _key of the map iterator
 * @description value as _value of the map iterator
 */
export class MapIterablePipe implements PipeTransform {

  /**
   * Transforms the given map record into an array list
   * @param records Records to be transformed
   */
  public transform(records: Map<any, any>): McsKeyValuePair[] {
    if (isNullOrEmpty(records)) { return []; }
    return this._convertMapToKeyValuPair(records);
  }

  /**
   * Converts the map to key value pair of array
   */
  private _convertMapToKeyValuPair(collections: Map<any, any>): McsKeyValuePair[] {
    let convertedArray: McsKeyValuePair[] = new Array();
    collections.forEach((_value, _key) => {
      convertedArray.push({ key: _key, value: _value });
    });
    return convertedArray;
  }
}
