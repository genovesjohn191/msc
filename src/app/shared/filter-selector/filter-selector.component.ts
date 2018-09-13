import {
  Component,
  OnInit,
  OnChanges,
  OnDestroy,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  ChangeDetectorRef,
  SimpleChanges
} from '@angular/core';
import {
  takeUntil,
  startWith
} from 'rxjs/operators';
import { Subject } from 'rxjs';
import {
  McsStorageService,
  McsFilterProvider,
  McsFilterInfo
} from '../../core';
import {
  isNullOrEmpty,
  convertJsonToMapObject,
  convertMapToJsonObject,
  animateFactory,
  convertSpacesToDash,
  unsubscribeSubject
} from '../../utilities';
import { TableComponent } from '../table/table.component';
import { ColumnDefDirective } from '../table';

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

export class FilterSelectorComponent implements OnInit, OnChanges, OnDestroy {
  @Input()
  public key: string;

  @Input()
  public associatedTable: TableComponent<any>;

  @Output()
  public filtersChange: EventEmitter<Map<string, McsFilterInfo>>;

  /**
   * Completed Filter items map
   */
  public filterItemsMap: Map<string, McsFilterInfo>;
  public displayedItemsMap: Map<string, McsFilterInfo>;

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
    this._initializeDisplayedFilters();
  }

  public ngOnChanges(_changes: SimpleChanges) {
    let _associatedTable = _changes['associatedTable'];
    if (!isNullOrEmpty(_associatedTable)) {
      this._listenToTableColumnChanges();
    }
  }

  public ngOnDestroy() {
    unsubscribeSubject(this._destroySubject);
  }

  /**
   * Returns the generated id based on the label given
   */
  public generateIdByLabel(label: string): string {
    return `${this.key}-${convertSpacesToDash(label)}`;
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

  /**
   * Listens to every table column changes
   */
  private _listenToTableColumnChanges(): void {
    if (isNullOrEmpty(this.associatedTable)) { return; }

    this.associatedTable.displayedColumns.changes
      .pipe(startWith(null), takeUntil(this._destroySubject))
      .subscribe(() =>
        this._initializeDisplayedFilters(this.associatedTable.displayedColumns.toArray())
      );
  }

  /**
   * Initializes displayed filters based on excluded items
   */
  private _initializeDisplayedFilters(columnsDef?: ColumnDefDirective[]): void {
    let filteredMap = new Map<string, McsFilterInfo>(this.filterItemsMap);
    let hasColumnDefinition = !isNullOrEmpty(this.associatedTable) && !isNullOrEmpty(columnsDef);

    if (hasColumnDefinition) {
      let deletedItems: string[] = [];
      filteredMap.forEach((_filterValue, _filterKey) => {
        let filterFound = columnsDef.find((_column) => _column.name === _filterKey);
        if (isNullOrEmpty(filterFound)) { deletedItems.push(_filterKey); }
      });
      deletedItems.forEach((deletedItem) => filteredMap.delete(deletedItem));
    }
    this.displayedItemsMap = filteredMap;
    this.onNotifyGetFilters();
  }
}
