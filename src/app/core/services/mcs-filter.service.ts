import { Injectable } from '@angular/core';
import { McsFilterInfo } from '@app/models';
import {
  compareArrays,
  convertJsonToMapObject,
  convertMapToJsonObject,
  createObject,
  isNullOrEmpty
} from '@app/utilities';
import { TranslateService } from '@ngx-translate/core';

import { McsStorageService } from '../services/mcs-storage.service';

@Injectable()
export class McsFilterService {
  private _config: any;
  private _filters: Map<string, McsFilterInfo[]>;

  constructor(
    private _storageService: McsStorageService,
    private _translateService: TranslateService
  ) {
    this._filters = new Map<string, any>();
    this.load();
  }

  /**
   * Gets the filter settings based on the key
   * @param key Key to be obtained from the settings or saved settings
   */
  public getFilterSettings(key: string): McsFilterInfo[] {
    let savedSettings = this._getSavedSettings(key);
    let defaultSettings = this._getDefaultSettings(key);

    if (isNullOrEmpty(savedSettings)) { return defaultSettings; }
    let comparisonResult = compareArrays(
      Array.from(savedSettings.keys()),
      Array.from(defaultSettings.keys())
    );
    return comparisonResult === 0 ? savedSettings : defaultSettings;
  }

  /**
   * Saves the filter settings based on the key and new value
   * @param key Key for the item
   * @param value Value to be saved on the item
   */
  public saveFilterSettings(key: string, value: Map<string, McsFilterInfo>): void {
    this._storageService.setItem(key, convertMapToJsonObject(value));
  }

  /**
   * Gets saved settings
   * @param key Key to be obtained
   */
  private _getSavedSettings(key: string): McsFilterInfo[] {
    let filterItemsJson = this._storageService.getItem<any>(key);
    let filterItemsMap = filterItemsJson && convertJsonToMapObject(filterItemsJson);
    return this._convertMapFiltersToArray(filterItemsMap);
  }

  /**
   * Gets the default settings
   * @param key Key to be obtained
   */
  private _getDefaultSettings(key: string): McsFilterInfo[] {
    let value: any = null;

    if (this._filters.has(key)) {
      value = this._filters.get(key);
    } else {
      value = this._config[key];
      this._filters.set(key, value);
    }

    let mapFilters = value && convertJsonToMapObject(value);
    let arrayFilters = this._convertMapFiltersToArray(mapFilters)

    // TODO(apascual): Remove all text in the filter.config because
    // this code will automatically obtained the text from columnHeader translation

    // Need to update manually the column header based on localization
    arrayFilters.forEach(filter => {
      let translatedValue = this._translateService.instant(`columnHeader.${filter.id}`);
      let valueObtainmentFailed = translatedValue?.includes(`columnHeader`);
      if (valueObtainmentFailed) { return; }
      filter.text = translatedValue;
    });
    return arrayFilters;
  }

  private _convertMapFiltersToArray(mapFilters: any): McsFilterInfo[] {
    if (isNullOrEmpty(mapFilters)) { return; }
    let convertedFilters = new Array<McsFilterInfo>();

    mapFilters.forEach((filterValue, filterKey) => {
      convertedFilters.push(
        createObject<any, McsFilterInfo>(McsFilterInfo, {
          ...filterValue,
          id: filterKey
        })
      );
    });
    return convertedFilters;
  }

  /**
   * Load filter configuration
   */
  private load(): void {
    this._config = require('../../config/filter.config.json');
  }
}
