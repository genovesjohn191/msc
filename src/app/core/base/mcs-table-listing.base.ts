import {
  ChangeDetectorRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  Injector
} from '@angular/core';
import {
  Subject,
  Observable,
  Subscription
} from 'rxjs';
import {
  takeUntil,
  tap,
  map
} from 'rxjs/operators';
import {
  isNullOrEmpty,
  convertMapToJsonObject,
  unsubscribeSafely,
  getSafeProperty,
  CommonDefinition
} from '@app/utilities';
import {
  McsFilterInfo,
  Breakpoint,
  McsApiCollection,
  McsQueryParam
} from '@app/models';
import {
  Search,
  Paginator,
  Table
} from '@app/shared';
import {
  EventBusState,
  EventBusDispatcherService
} from '@peerlancers/ngx-event-bus';
import { McsBrowserService } from '../services/mcs-browser.service';
import { McsFilterService } from '../services/mcs-filter.service';
import { McsTableDataSource } from '../data-access/mcs-table-datasource';
import { McsTableSelection } from '../data-access/mcs-table-selection';
import { IMcsColumnManager } from '../interfaces/mcs-column-manager.interface';

export interface TableListingConfig<T> {
  dataChangeEvent?: EventBusState<T[]>;
  dataClearEvent?: EventBusState<void>;
  allowMultipleSelection?: boolean;
}

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

  private _search: Search;
  private _paginator: Paginator;
  private _table: Table;

  constructor(
    protected injector: Injector,
    protected changeDetectorRef: ChangeDetectorRef,
    protected tableConfig: TableListingConfig<T> = {}
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

    if (!isNullOrEmpty(this.dataSource)) {
      this.dataSource.disconnect();
    }
  }

  @ViewChild('search', { static: false })
  public set search(value: Search) {
    if (this._search !== value) {
      this._search = value;
      this.dataSource.registerSearch(value);
    }
  }

  @ViewChild('paginator', { static: false })
  public set paginator(value: Paginator) {
    if (this._paginator !== value) {
      this._paginator = value;
      this.dataSource.registerPaginator(value);
    }
  }

  @ViewChild('table', { static: false })
  public set table(value: Table) {
    if (this._table !== value) {
      this._table = value;
      this._initializeDataColumns();
    }
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
      pageIndex: getSafeProperty(this._paginator, (obj) => obj.pageIndex, CommonDefinition.PAGE_INDEX_DEFAULT),
      pageSize: getSafeProperty(this._paginator, (obj) => obj.pageSize, CommonDefinition.PAGE_SIZE_MIN),
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
