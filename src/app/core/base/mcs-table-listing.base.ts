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
  unsubscribeSubject,
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
  FilterSelector
} from '@app/shared';
import {
  EventBusState,
  EventBusDispatcherService
} from '@app/event-bus';
import { McsBrowserService } from '../services/mcs-browser.service';
import { McsTableDataSource } from '../data-access/mcs-table-datasource';
import { McsTableSelection } from '../data-access/mcs-table-selection';

export abstract class McsTableListingBase<T> implements AfterViewInit, OnDestroy {
  @ViewChild('search')
  public search: Search;

  @ViewChild('paginator')
  public paginator: Paginator;

  @ViewChild('filterSelector')
  public filterSelector: FilterSelector;

  // Table variables
  public selection: McsTableSelection<T>;
  public dataSource: McsTableDataSource<T>;
  public dataColumns: string[] = [];
  public columnSettings: any;

  protected readonly browserService: McsBrowserService;
  protected readonly eventDispatcher: EventBusDispatcherService;

  // Other variables
  private _baseDestroySubject = new Subject<void>();
  private _totalRecordsCount: number = 0;
  private _isMobile: boolean;
  private _dataChangeHandler: Subscription;

  constructor(
    protected injector: Injector,
    protected changeDetectorRef: ChangeDetectorRef,
    protected dataChangeEvent?: EventBusState<T[]>,
    protected allowMultipleSelection?: boolean
  ) {
    this.dataSource = new McsTableDataSource<T>([]);
    this.selection = new McsTableSelection(this.dataSource, allowMultipleSelection || true);

    this.browserService = injector.get(McsBrowserService);
    this.eventDispatcher = injector.get(EventBusDispatcherService);

    this._registerDataChangeEvent();
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
    if (!isNullOrEmpty(this.dataSource)) {
      this.dataSource.disconnect();
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
    return isNullOrEmpty(this.search) ? false :
      this.search.keyword.length > 0;
  }

  /**
   * Returns the total records count of the record
   */
  public get totalRecordsCount(): number {
    return Math.max(this._totalRecordsCount, 0);
  }

  /**
   * Update the column settings based on filtered selectors
   * and update the data column of the table together
   * @param columns New column settings
   */
  public updateColumnSettings(columns: Map<string, McsFilterInfo>): void {
    if (isNullOrEmpty(columns)) { return; }
    this.columnSettings = convertMapToJsonObject(columns);
    this.dataColumns = Object.keys(this.columnSettings);
    this.changeDetectorRef.markForCheck();
  }

  /**
   * Retry the obtainment from the datasource when an error occured
   */
  public retryDatasource(): void {
    if (isNullOrEmpty(this.dataSource)) { return; }
    this._initializeDataSource();
  }

  protected abstract getEntityListing(query: McsQueryParam): Observable<McsApiCollection<T>>;

  /**
   * Returns the column settings filter key or the listing table
   */
  protected abstract get columnSettingsKey(): string;

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
    unsubscribeSubject(this._baseDestroySubject);
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
   * Initializes data source based on the entity collection
   */
  private _initializeDataSource(): void {
    this.dataSource.updateDatasource(this._getEntityCollection.bind(this));

    if (!isNullOrEmpty(this.search)) {
      this.dataSource.registerSearch(this.search);
    }
    if (!isNullOrEmpty(this.paginator)) {
      this.dataSource.registerPaginator(this.paginator);
    }
    this.changeDetectorRef.markForCheck();
  }

  /**
   * Get entity collection content
   */
  private _getEntityCollection(): Observable<T[]> {
    return this.getEntityListing({
      pageIndex: getSafeProperty(this.paginator, (obj) => obj.pageIndex, CommonDefinition.PAGE_INDEX_DEFAULT),
      pageSize: getSafeProperty(this.paginator, (obj) => obj.pageSize, CommonDefinition.PAGE_SIZE_MIN),
      keyword: getSafeProperty(this.search, (obj) => obj.keyword, '')
    }).pipe(
      tap((apiCollection) => this._setTotalRecordsCount(apiCollection.totalCollectionCount)),
      map((entityCollection) => entityCollection.collection)
    );
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
  private _registerDataChangeEvent(): void {
    if (isNullOrEmpty(this.dataChangeEvent)) { return; }

    this._dataChangeHandler = this.eventDispatcher.addEventListener(
      this.dataChangeEvent, this._onDataChanged.bind(this)
    );
  }

  /**
   * Event that emits when the data on the listing has been changed
   * @param dataRecords Data records to be listened
   */
  private _onDataChanged(dataRecords: T[]): void {
    if (isNullOrEmpty(dataRecords)) { this.dataSource.refreshDataRecords(); }
    this.changeDetectorRef.markForCheck();
  }
}
