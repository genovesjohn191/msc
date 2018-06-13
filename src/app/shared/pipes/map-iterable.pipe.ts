import {
  Pipe,
  PipeTransform
} from '@angular/core';
import { McsKeyValuePair } from '../../core';
import {
  isNullOrEmpty,
  compareMaps
} from '../../utilities';

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
  private _cacheMap: Map<any, any>;

  public transform(records: Map<any, any>): McsKeyValuePair[] {
    if (isNullOrEmpty(records)) { return []; }

    let resetCache = isNullOrEmpty(this._cacheMap) ||
      compareMaps(this._cacheMap, records) !== 0;
    if (resetCache) {
      this._cacheMap = new Map(records);
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
