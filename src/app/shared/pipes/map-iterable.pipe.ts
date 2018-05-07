import {
  Pipe,
  PipeTransform
} from '@angular/core';
import { McsKeyValuePair } from '../../core';
import { isNullOrEmpty } from '../../utilities';

@Pipe({
  name: 'mcsMapIterable',
  pure: false
})

/**
 * Returns the following values of the iterable map
 * @description key as _key of the map iterator
 * @description value as _value of the map iterator
 */
export class MapIterablePipe implements PipeTransform {

  /**
   * Array cache of the actual data
   */
  private _cacheArray: McsKeyValuePair[];
  private _recordCount: number = 0;

  public transform(records: Map<any, any>): McsKeyValuePair[] {
    if (isNullOrEmpty(records)) { return this._cacheArray; }

    let resetCache = this._recordCount !== records.size;
    if (resetCache) {
      this._recordCount = records.size;
      this._resetCache(records);
    }
    return this._cacheArray;
  }

  /**
   * Resets the cache of the map
   */
  private _resetCache(collections: Map<any, any>): void {
    this._cacheArray = new Array();
    collections.forEach((_value, _key) => {
      this._cacheArray.push({ key: _key, value: _value });
    });
  }
}
