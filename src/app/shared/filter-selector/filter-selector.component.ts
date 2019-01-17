import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  ChangeDetectorRef
} from '@angular/core';
import { Subject } from 'rxjs';
import {
  McsStorageService,
  McsFilterProvider
} from '@app/core';
import { McsFilterInfo } from '@app/models';
import {
  isNullOrEmpty,
  convertJsonToMapObject,
  convertMapToJsonObject,
  animateFactory,
  unsubscribeSubject
} from '@app/utilities';
import { FilterSelector } from './filter-selector.interface';

type FilterSelectorDetails = {
  visible: boolean,
  key: string,
  item: McsFilterInfo
};

@Component({
  selector: 'mcs-filter-selector',
  templateUrl: './filter-selector.component.html',
  styleUrls: ['./filter-selector.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    animateFactory.fadeIn
  ],
  host: {
    'class': 'filter-selector-wrapper'
  }
})

export class FilterSelectorComponent implements OnInit, OnDestroy, FilterSelector {
  @Input()
  public key: string;

  @Output()
  public filtersChange: EventEmitter<Map<string, McsFilterInfo>>;

  /** Original record of the filters */
  public filterItemsMap: Map<string, McsFilterInfo>;
  public displayedItemsMap: Map<string, McsFilterInfo>;

  public displayedSelectors: FilterSelectorDetails[] = [];
  private _destroySubject = new Subject<void>();

  public constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _storageService: McsStorageService,
    private _filterProvider: McsFilterProvider
  ) {
    this.key = '';
    this.filtersChange = new EventEmitter();
  }

  public ngOnInit() {
    this._getFilterItems();
    this._setDisplayedSelectors();
    this.onNotifyGetFilters();
  }

  public ngOnDestroy() {
    unsubscribeSubject(this._destroySubject);
  }

  /**
   * Notify the outside subscribers that the filter has been changed
   */
  public onNotifyGetFilters(): void {
    if (isNullOrEmpty(this.filterItemsMap)) { return; }
    this._storageService.setItem(this.key, convertMapToJsonObject(this.filterItemsMap));

    // Create map for the definition
    let itemsMap = new Map<string, McsFilterInfo>();
    this.displayedSelectors.forEach((selector) => itemsMap.set(selector.key, selector.item));
    this.filtersChange.emit(itemsMap);
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Remove the filter selector based on the key provided
   * @param key Key to be removed on the record list
   */
  public removeFilterSelector(key: string): void {
    let recordFound = this.displayedSelectors.find((item) => item.key === key);
    if (isNullOrEmpty(recordFound)) { return; }
    recordFound.visible = false;
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Add the filter selector based on the key provided
   * @param key Key to be added on the filter selector
   */
  public addFilterSelector(key: string): void {
    let recordFound = this.displayedSelectors.find((item) => item.key === key);
    if (isNullOrEmpty(recordFound)) { return; }
    recordFound.visible = true;
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Get the filter items in the storage and check if it is updated or not
   * otherwise get default filter settings
   */
  private _getFilterItems(): void {
    // Get the filter from storage
    let filterItemsJson = this._storageService.getItem<any>(this.key);
    if (isNullOrEmpty(filterItemsJson)) {
      filterItemsJson = this._filterProvider.getDefaultFilters(this.key);
      this.filterItemsMap = convertJsonToMapObject<McsFilterInfo>(filterItemsJson);
      return;
    }

    // Compare the default strin and current string if there are difference
    let defaultFiltersString = this._convertToComparableString(
      this._filterProvider.getDefaultFilters(this.key)
    );
    let savedFiltersString = this._convertToComparableString(filterItemsJson);
    let isEqual: boolean = defaultFiltersString === savedFiltersString;
    if (!isEqual) { filterItemsJson = this._filterProvider.getDefaultFilters(this.key); }
    this.filterItemsMap = convertJsonToMapObject<McsFilterInfo>(filterItemsJson);
  }

  /**
   * Converts the filter items into comparable string
   * @param filters Filter items to be converted
   */
  private _convertToComparableString(filters: any): string {
    return JSON.stringify(filters)
      .replace(/,"value":true/gi, '')
      .replace(/,"value":false/gi, '');
  }

  /**
   * Sets the displayed selectors
   */
  private _setDisplayedSelectors(): void {
    this.filterItemsMap.forEach((itemValue, itemKey) => {
      this.displayedSelectors.push({
        visible: true,
        key: itemKey,
        item: itemValue
      } as FilterSelectorDetails);
    });
  }
}
