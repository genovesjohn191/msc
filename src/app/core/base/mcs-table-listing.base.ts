import {
  Observable,
  Subject,
  Subscription
} from 'rxjs';
import {
  map,
  takeUntil,
  tap
} from 'rxjs/operators';

import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Inject,
  InjectionToken,
  Injector,
  OnDestroy,
  ViewChild
} from '@angular/core';
import {
  EventBusDispatcherService,
  EventBusState
} from '@app/event-bus';
import {
  Breakpoint,
  McsApiCollection,
  McsFilterInfo,
  McsQueryParam
} from '@app/models';
import {
  Paginator,
  Search,
  Table
} from '@app/shared';
import {
  getSafeProperty,
  isNullOrEmpty,
  unsubscribeSafely,
  CommonDefinition
} from '@app/utilities';

import { McsTableDataSource } from '../data-access/mcs-table-datasource';
import { McsTableSelection } from '../data-access/mcs-table-selection';
import { IMcsColumnManager } from '../interfaces/mcs-column-manager.interface';
import { McsBrowserService } from '../services/mcs-browser.service';
import { McsFilterService } from '../services/mcs-filter.service';

export interface TableListingConfig<T> {
  dataChangeEvent?: EventBusState<T[]>;
  dataClearEvent?: EventBusState<void>;
  entityDeleteEvent?: EventBusState<any>;
  allowMultipleSelection?: boolean;
}

export const TABLELISTINGCONFIG_INJECTION = new InjectionToken<TableListingConfig<any>>('TableListingConfig');

@Component({ template: ''})
export abstract class McsTableListingBase<T> implements AfterViewInit, OnDestroy, IMcsColumnManager {

  // Table variables
  public selection: McsTableSelection<T>;
  public dataSource: McsTableDataSource<T>;
  public dataColumns: string[] = [];
  public dataFilters: McsFilterInfo[] = [];
  public columnSettings: any = {};

  protected readonly filterService: McsFilterService;
  protected readonly browserService: McsBrowserService;
  protected readonly eventDispatcher: EventBusDispatcherService;

  // Other variables
  private _baseDestroySubject = new Subject<void>();
  private _totalRecordsCount: number = 0;
  private _isMobile: boolean;
  private _dataChangeHandler: Subscription;
  private _dataClearHandler: Subscription;
  private _entityDeleteHandler: Subscription;

  private _search: Search;
  private _paginator: Paginator;
  private _table: Table;

  constructor(
    protected injector: Injector,
    protected changeDetectorRef: ChangeDetectorRef,
    @Inject(TABLELISTINGCONFIG_INJECTION) protected tableConfig: TableListingConfig<T> = {}
  ) {
    this.dataSource = new McsTableDataSource<T>([]);
    this.selection = new McsTableSelection(this.dataSource, tableConfig.allowMultipleSelection || true);

    this.filterService = injector.get(McsFilterService);
    this.browserService = injector.get(McsBrowserService);
    this.eventDispatcher = injector.get(EventBusDispatcherService);

    this._registerDataEvents();
    this._initializeDataColumns();
    this._subscribeToDatasourceRendered();
    this._subscribeToBreakpointChange();
  }

  public ngAfterViewInit() {
    Promise.resolve().then(() => {
      this._initializeDataSource();
    });
  }

  public ngOnDestroy() {
    unsubscribeSafely(this._baseDestroySubject);
    unsubscribeSafely(this._dataChangeHandler);
    unsubscribeSafely(this._dataClearHandler);
    unsubscribeSafely(this._entityDeleteHandler);

    if (!isNullOrEmpty(this.dataSource)) {
      this.dataSource.disconnect();
    }
  }

  @ViewChild('search')
  public set search(value: Search) {
    if (this._search !== value) {
      this._search = value;
      this.dataSource.registerSearch(value);
    }
  }

  @ViewChild('paginator')
  public set paginator(value: Paginator) {
    if (this._paginator !== value) {
      this._paginator = value;
      this.dataSource.registerPaginator(value);
    }
  }

  @ViewChild('table')
  public set table(value: Table) {
    if (this._table !== value) {
      this._table = value;
      this._initializeDataColumns();
    }
  }

  public get pageIndex(): number {
    return getSafeProperty(this._paginator, (obj) => obj.pageIndex, CommonDefinition.PAGE_INDEX_DEFAULT);
  }

  public get pageSize(): number {
    return getSafeProperty(this._paginator, (obj) => obj.pageSize, CommonDefinition.PAGE_SIZE_MIN);
  }

  /**
   * Returns true when mode is mobile
   */
  public get isMobile(): boolean {
    return this._isMobile;
  }

  /**
   * Returns true when search box is currently processing
   */
  public get isSearching(): boolean {
    return isNullOrEmpty(this._search) ? false :
      this._search.keyword && this._search.keyword.length > 0;
  }

  public get hasNextPage(): boolean {
    return this.totalRecordsCount > (this.pageIndex * this.pageSize);
  }

  /**
   * Returns the total records count of the record
   */
  public get totalRecordsCount(): number {
    return Math.max(this._totalRecordsCount, 0);
  }

  /**
   * Event that emits when the filter has been changed
   * @param updatedFilters New column settings
   */
  public onColumnFilterChange(updatedFilters: McsFilterInfo[]): void {
    if (isNullOrEmpty(updatedFilters)) { return; }
    this._setColumnSettings(updatedFilters);
    this._updateTableColumns(updatedFilters);
  }

  /**
   * Retry the obtainment from the datasource when an error occured
   */
  public retryDatasource(): void {
    if (isNullOrEmpty(this.dataSource)) { return; }
    this._initializeDataSource();
  }

  /**
   * Include the column to selectors
   * @param column Column to be filtered
   */
  public includeColumn(_column: McsFilterInfo): boolean {
    return true;  // noop
  }

  public abstract get columnSettingsKey(): string;

  protected abstract getEntityListing(query: McsQueryParam): Observable<McsApiCollection<T>>;

  /**
   * Dispose all of the resource from the datasource including all the subscription
   *
   * `@Note`: This should be call inside the destroy of the component
   */
  protected dispose(): void {
    if (!isNullOrEmpty(this.dataSource)) {
      (this.dataSource as any).disconnect();
    }
    if (!isNullOrEmpty(this.dataColumns)) {
      this.dataColumns = [];
      this.dataColumns = null;
    }
    unsubscribeSafely(this._baseDestroySubject);
  }

  /**
   * Subscribes to data source rendered
   */
  private _subscribeToDatasourceRendered(): void {
    this.dataSource.dataRenderedChange().pipe(
      takeUntil(this._baseDestroySubject),
      tap(() => this.changeDetectorRef.markForCheck())
    ).subscribe();
  }

  /**
   * Listen to any changes in size of the browser
   */
  private _subscribeToBreakpointChange(): void {
    this.browserService.breakpointChange().pipe(
      takeUntil(this._baseDestroySubject)
    ).subscribe((deviceType) => {
      this._isMobile = deviceType === Breakpoint.Small ||
        deviceType === Breakpoint.XSmall;
      this.changeDetectorRef.markForCheck();
    });
  }

  /**
   * Initializes data columns
   */
  private _initializeDataColumns(): void {
    let savedSettings = this.filterService.getFilterSettings(this.columnSettingsKey);
    let filteredColumns = savedSettings && savedSettings.filter(this.includeColumn.bind(this));

    this._setColumnSettings(filteredColumns);
    this._updateTableColumns(filteredColumns);
  }

  /**
   * Initializes data source based on the entity collection
   */
  private _initializeDataSource(): void {
    this.dataSource.updateDatasource(this._getEntityCollection.bind(this));
    this.changeDetectorRef.markForCheck();
  }

  /**
   * Get entity collection content
   */
  private _getEntityCollection(): Observable<T[]> {
    return this.getEntityListing({
      pageIndex: this.pageIndex,
      pageSize: this.pageSize,
      keyword: getSafeProperty(this._search, (obj) => obj.keyword, '')
    }).pipe(
      tap((apiCollection) => this._setTotalRecordsCount(apiCollection.totalCollectionCount)),
      map((entityCollection) => entityCollection.collection)
    );
  }

  /**
   * Sets the updated column settings
   * @param filterSettings Updated filter settings to be set
   */
  private _setColumnSettings(filterSettings: McsFilterInfo[]): void {
    if (isNullOrEmpty(filterSettings)) { return; }

    this.dataColumns = filterSettings.map((filter) => filter.id);

    this.dataFilters = Array.from(filterSettings);
    this.dataFilters.forEach((dataFilter) => {
      this.columnSettings[dataFilter.id] = Object.create(dataFilter);
    });
    this.changeDetectorRef.markForCheck();
  }

  /**
   * Updates the table columns filter settings
   * @param filterSettings Filter settings to be updated
   */
  private _updateTableColumns(filterSettings: McsFilterInfo[]): void {
    if (isNullOrEmpty(filterSettings)) { return; }

    let displayedColumns: string[] = [];
    filterSettings.forEach((filter) => {
      if (filter.value) { displayedColumns.push(filter.id); }
    });

    if (!isNullOrEmpty(this._table)) {
      this._table.showColumns(...displayedColumns);
    }
  }

  /**
   * Sets the total records count
   * @param count Count to be set
   */
  private _setTotalRecordsCount(count: number): void {
    this._totalRecordsCount = count;
    this.changeDetectorRef.markForCheck();
  }

  /**
   * Registers data change event handlers
   */
  private _registerDataEvents(): void {
    if (!isNullOrEmpty(this.tableConfig.dataChangeEvent)) {
      this._dataChangeHandler = this.eventDispatcher.addEventListener(
        this.tableConfig.dataChangeEvent, this._onDataChanged.bind(this)
      );
    }

    if (!isNullOrEmpty(this.tableConfig.dataClearEvent)) {
      this._dataClearHandler = this.eventDispatcher.addEventListener(
        this.tableConfig.dataClearEvent, this._onDataClear.bind(this)
      );
    }

    if (!isNullOrEmpty(this.tableConfig.entityDeleteEvent)) {
      this._entityDeleteHandler = this.eventDispatcher.addEventListener(
        this.tableConfig.entityDeleteEvent, this._onDelete.bind(this)
      );
    }
  }

  private _onDelete(): void {
    if (this.isSearching) {
      // TODO: need to update search result
      this._initializeDataSource();
    } else {
      this._initializeDataSource();
    }
  }

  /**
   * Event that emits when the data on the listing has been changed
   * @param _dataRecords Data records to be listened
   */
  private _onDataChanged(_dataRecords: T[]): void {
    this.changeDetectorRef.markForCheck();
  }

  /**
   * Event that emits when the data has been cleared
   */
  private _onDataClear(): void {
    if (isNullOrEmpty(this.dataSource)) { return; }
    this.dataSource.refreshDataRecords();
  }
}
