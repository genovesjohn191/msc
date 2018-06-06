import {
  Component,
  OnInit,
  OnChanges,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  ChangeDetectorRef,
  SimpleChanges
} from '@angular/core';
import {
  McsStorageService,
  McsFilterProvider,
  McsFilterInfo
} from '../../core';
import {
  isNullOrEmpty,
  convertJsonToMapObject,
  convertMapToJsonObject,
  animateFactory
} from '../../utilities';

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

export class FilterSelectorComponent implements OnInit, OnChanges {
  @Input()
  public key: string;

  @Input()
  public excludedFilterKeys: string[];

  @Output()
  public filtersChange: EventEmitter<Map<string, McsFilterInfo>>;

  /**
   * Completed Filter items map
   */
  public filterItemsMap: Map<string, McsFilterInfo>;

  /**
   * Returns the displayed filter items
   */
  public get displayedItemsMap(): Map<string, McsFilterInfo> {
    if (isNullOrEmpty(this.excludedFilterKeys)) { return this.filterItemsMap; }

    // Removed the excluded items in the map list
    let filteredMap = new Map<string, McsFilterInfo>(this.filterItemsMap);
    this.excludedFilterKeys.forEach((excludedItemKey) => filteredMap.delete(excludedItemKey));
    return filteredMap;
  }

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
    this.onNotifyGetFilters();
  }

  public ngOnChanges(changes: SimpleChanges) {
    let excludedKeyChanges = changes['excludedFilterKeys'];
    if (!isNullOrEmpty(excludedKeyChanges)) {
      this.onNotifyGetFilters();
    }
  }

  /**
   * Notify the outside subscribers that the filter has been changed
   */
  public onNotifyGetFilters(): void {
    if (isNullOrEmpty(this.filterItemsMap)) { return; }
    this._storageService.setItem(this.key, convertMapToJsonObject(this.filterItemsMap));
    this.filtersChange.emit(this.displayedItemsMap);
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
}
