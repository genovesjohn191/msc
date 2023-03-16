import {
  of,
  BehaviorSubject,
  EMPTY,
  Observable,
  Subject
} from 'rxjs';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  exhaustMap,
  filter,
  map,
  shareReplay,
  startWith,
  switchMap,
  takeUntil,
  tap
} from 'rxjs/operators';

import { CollectionViewer } from '@angular/cdk/collections';
import { MatSort } from '@angular/material/sort';
import {
  DataStatus,
  McsFilterInfo
} from '@app/models';
import {
  ColumnFilter,
  Paginator,
  Search
} from '@app/shared';
import {
  addOrUpdateArrayRecord,
  deleteArrayRecord,
  getSafeProperty,
  isNullOrEmpty,
  isNullOrUndefined,
  unsubscribeSafely,
  CommonDefinition,
  McsDataSource,
  McsDisposable
} from '@app/utilities';

import { FILTER_LEFT_PANEL_ID } from '../services/mcs-filter.service';

export class McsMatTableConfig<TEntity> {

  /**
   * Constructor
   * @param applyDefaultPagination Include next page from previous page, default to false.
   * @param manualDispose Manually dispose the datasource class, default to false
   * @param recordMatchPredicate Matching predicate for each record
   */
  constructor(
    public applyDefaultPagination?: boolean,
    public manualDispose?: boolean,
    public recordMatchPredicate?: (source: TEntity, target: TEntity) => boolean
  ) { }
}

export class McsMatTableContext<TEntity> {
  constructor(
    public dataRecords: TEntity[],
    public totalCount: number = dataRecords?.length || 0
  ) { }
}

export class McsMatTableQueryParam {
  constructor(
    public search: Search,
    public paginator: Paginator,
    public sort: MatSort
  ) {
    if (isNullOrEmpty(this.paginator)) {
      this.paginator = Object.create({});
      this.paginator.pageIndex = CommonDefinition.PAGE_INDEX_DEFAULT;
      this.paginator.pageSize = CommonDefinition.PAGE_SIZE_MIN;
    }

    if (isNullOrEmpty(this.sort)) {
      this.sort = Object.create({});
    }
  }
}

type DelegateSource<TEntity> = (param?: McsMatTableQueryParam) =>
  Observable<McsMatTableContext<TEntity>>;

type DatasourceType<TEntity> = McsMatTableContext<TEntity> |
  Observable<McsMatTableContext<TEntity>> | DelegateSource<TEntity>;

export class McsTableDataSource2<TEntity> implements McsDataSource<TEntity>, McsDisposable {
  public dataColumns$: Observable<string[]>;
  public isInProgress$: Observable<boolean>;
  public isSorting$: Observable<boolean>;
  public hasNoRecords$: Observable<boolean>;
  public hasError$: Observable<boolean>;
  public dataRecords$: Observable<TEntity[]>;
  public totalCount$: Observable<number>;
  public displayedCount$: Observable<number>;

  private _columnFilter: ColumnFilter;
  private _search: Search;
  private _paginator: Paginator;
  private _sort: MatSort;
  private _configuration: McsMatTableConfig<TEntity>;

  private _datasourceFunc: DelegateSource<TEntity>;
  private _dataRecordsChange = new BehaviorSubject<TEntity[]>(null);
  private _dataColumnsChange = new BehaviorSubject<string[]>(null);
  private _dataStatusChange = new BehaviorSubject<DataStatus>(null);
  private _dataCountChange = new BehaviorSubject<number>(0);
  private _sortingChange = new BehaviorSubject<boolean>(null);
  private _requestUpdate = new Subject<void>();

  private _destroySubject = new Subject<void>();
  private _searchSubject = new Subject<void>();
  private _pageSubject = new Subject<void>();
  private _sortSubject = new Subject<void>();
  private _columnSelectorSubject = new Subject<void>();

  constructor(dataSource?: DatasourceType<TEntity>) {
    this.updateDatasource(dataSource);
    this._subscribeToIsInProgressFlag();
    this._subscribeToHasNoRecordsFlag();
    this._subscribeToHasErrorFlag();
    this._subscribeToTotalCountChange();
    this._subscribeToDisplayedCountChange();
    this._subscribeToDataRecordsChange();
    this._subscribeToDataColumnsChange();
    this._subscribeToSortingChange();
  }

  public connect(_collectionViewer: CollectionViewer): Observable<TEntity[]> {
    return this._dataRecordsChange.pipe(
      filter((records) => records !== null),
      tap(() => this._updateDataColumns())
    );
  }

  public disconnect(_collectionViewer: CollectionViewer): void {
    if (this._configuration?.manualDispose) { return; }
    this.dispose();
  }

  public dispose(): void {
    unsubscribeSafely(this._destroySubject);

    unsubscribeSafely(this._dataRecordsChange);
    unsubscribeSafely(this._requestUpdate);
    unsubscribeSafely(this._searchSubject);
    unsubscribeSafely(this._pageSubject);
    unsubscribeSafely(this._columnSelectorSubject);
    unsubscribeSafely(this._dataColumnsChange);
    unsubscribeSafely(this._dataStatusChange);
    unsubscribeSafely(this._dataCountChange);

    this._resetPaginator();
  }

  public onCompletion(data?: TEntity[]): void {
    this._sortingChange.next(false);
    if (!isNullOrEmpty(this._search)) {
      this._search.showLoading(false);
    }
    if (!isNullOrEmpty(this._paginator)) {
      this._paginator.showLoading(false);
    }
  }

  public dataStatusChange(): Observable<DataStatus> {
    return this._dataStatusChange.asObservable();
  }

  public updateDatasource(dataSource: DatasourceType<TEntity>): void {
    this._setDatasourcePointer(dataSource);
    this._subscribeToRequestUpdate();
  }

  public registerConfiguration(config: McsMatTableConfig<TEntity>): McsTableDataSource2<TEntity> {
    this._configuration = config;
    this._requestUpdate.next();
    return this;
  }

  public registerPaginator(paginator: Paginator): McsTableDataSource2<TEntity> {
    this._paginator = paginator;
    this._subscribeToPageChange();
    return this;
  }

  public registerSearch(search: Search): McsTableDataSource2<TEntity> {
    this._search = search;
    this._subscribeToSearchChange();
    return this;
  }

  public registerSort(sort: MatSort): McsTableDataSource2<TEntity> {
    this._sort = sort;
    this._subscribeToSortChange();
    return this;
  }

  public clear(): void {
    this._dataRecordsChange.next([]);
  }

  public registerColumnFilter(columnFilter: ColumnFilter): McsTableDataSource2<TEntity> {
    if (this._columnFilter === columnFilter) { return this; }
    this._columnFilter = columnFilter;
    this._subscribeToColumnChange();
    return this;
  }

  public registerColumnsFilterInfo(
    columns: McsFilterInfo[],
    predicate?: (filter: McsFilterInfo) => boolean
  ): McsTableDataSource2<TEntity> {
    if (!isNullOrEmpty(this._columnFilter)) {
      // We always want to prioritize the registerColumnFilter as component.
      // because sometimes the change detection is executing first prior class initialization
      return;
    }

    let columnFilter = {
      filters: columns,
      filtersChange: new BehaviorSubject(columns),
      filterPredicate: predicate
    } as ColumnFilter;
    return this.registerColumnFilter(columnFilter);
  }

  public refreshDataRecords(): void {
    this._resetPaginator();
    this._requestUpdate.next();
    this._dataRecordsChange.next(null);
  }

  public insertRecord(dataRecord: TEntity, insertIndex?: number): void {
    if (isNullOrEmpty(dataRecord)) { return; }

    let existingRecords = this._dataRecordsChange.getValue() || [];
    !isNullOrUndefined(insertIndex) ?
      existingRecords.splice(insertIndex, 0, dataRecord) :
      existingRecords.push(dataRecord);

    this._dataRecordsChange.next(existingRecords);
  }

  public deleteRecord(predicate: (item: TEntity) => boolean): void {
    let existingRecords = this._dataRecordsChange.getValue();
    if (isNullOrEmpty(existingRecords)) { return; }

    existingRecords = deleteArrayRecord(existingRecords, predicate);
    this._dataRecordsChange.next(existingRecords);
  }

  public findRecord(predicate: (item: TEntity) => boolean): TEntity {
    let dataRecords = this._dataRecordsChange.getValue() || [];
    return dataRecords.find(predicate);
  }

  private _setDatasourcePointer(dataSource: DatasourceType<TEntity>): void {
    if (isNullOrEmpty(dataSource)) { return; }

    let dataSourceIsPredicate = typeof dataSource === 'function';
    this._datasourceFunc = dataSourceIsPredicate ?
      dataSource : this._convertDatasourceToObservable.bind(this);
  }

  private _convertDatasourceToObservable(
    dataSource: DatasourceType<TEntity>
  ): Observable<McsMatTableContext<TEntity>> {
    if (isNullOrUndefined(dataSource)) { return of(null); }

    if (dataSource instanceof Observable) {
      return dataSource;
    } else if (dataSource instanceof McsMatTableContext) {
      return of(dataSource);
    }
  }

  private _subscribeToColumnChange(): void {
    if (isNullOrEmpty(this._columnFilter)) { return; }
    this._columnSelectorSubject.next();

    this._columnFilter.filtersChange.pipe(
      takeUntil(this._columnSelectorSubject),
      tap((state) => {
        if (isNullOrEmpty(state)) { return; }

        let displayedColumns = state
          .filter(item => {
            return !this._columnFilter.filterPredicate ? item.value :
              this._columnFilter.filterPredicate(item) && item.value;
          })
          .map(item => item.id)
          .filter(id => id !== FILTER_LEFT_PANEL_ID);

        this._dataColumnsChange.next(displayedColumns);
      })
    ).subscribe();
  }

  private _subscribeToSearchChange(): void {
    if (isNullOrEmpty(this._search)) { return; }

    this._searchSubject.next();
    this._search.searchChangedStream.pipe(
      takeUntil(this._searchSubject),
      tap(() => {
        this._resetPaginator();
        this._requestUpdate.next();
      })
    ).subscribe();
  }

  private _subscribeToPageChange(): void {
    if (isNullOrEmpty(this._pageSubject)) { return; }

    this._pageSubject.next();
    this._paginator.pageChangedStream.pipe(
      takeUntil(this._pageSubject),
      tap(() => {
        this._requestUpdate.next();
      })
    ).subscribe();
  }

  private _subscribeToSortChange(): void {
    if (isNullOrEmpty(this._sort?.sortChange)) { return; }

    this._sortSubject.next();
    this._sort.sortChange.pipe(
      takeUntil(this._sortSubject),
      tap(() => {
        this._paginator?.reset();
        this._requestUpdate.next();

        if (this._configuration?.applyDefaultPagination) { 
          this._dataRecordsChange.next(null);
        }

        this._sortingChange.next(true);
      })
    ).subscribe();
  }

  private _subscribeToRequestUpdate(): void {
    this._requestUpdate.pipe(
      startWith([null]),
      takeUntil(this._destroySubject),
      switchMap(() => {
        if (isNullOrUndefined(this._datasourceFunc)) { return of(null); }

        this._dataStatusChange.next(DataStatus.Active);
        let tableParam = new McsMatTableQueryParam(this._search, this._paginator, this._sort);

        return this._datasourceFunc(tableParam).pipe(
          exhaustMap(response => {
            let dataRecords = getSafeProperty(response, obj => obj.dataRecords) || [];
            let totalRecordsCount = getSafeProperty(response, obj => obj.totalCount) || 0;
            return of(new McsMatTableContext(dataRecords, totalRecordsCount));
          }),
          catchError(_error => {
            this._dataStatusChange.next(DataStatus.Error);
            this._sortingChange.next(false);
            return EMPTY;
          })
        );
      }),
      distinctUntilChanged(),
      debounceTime(300),
      tap(response => {
        if (isNullOrUndefined(this._datasourceFunc) ||
          isNullOrUndefined(response)) { return; }

        this.onCompletion(response.dataRecords);
        this._updateDataRecords(response.dataRecords);
        this._setTotalRecordsCount(response.totalCount);
        this._dataStatusChange.next(
          isNullOrEmpty(response.dataRecords) ? DataStatus.Empty : DataStatus.Success
        );
      })
    ).subscribe();
  }

  private _updateDataRecords(records: TEntity[]): void {
    if (!this._configuration?.applyDefaultPagination) {
      this._dataRecordsChange.next(records);
      return;
    }

    let existingRecords = this._dataRecordsChange.getValue() || [];
    if (this._configuration?.recordMatchPredicate) {
      records?.forEach(record => {
        if (isNullOrEmpty(record)) { return; }
        addOrUpdateArrayRecord(existingRecords, record, false,
          existingRecord => this._configuration.recordMatchPredicate(existingRecord, record)
        );
      });
    } else {
      existingRecords.push(...records);
    }

    this._dataRecordsChange.next(existingRecords);
  }

  private _updateDataColumns(): void {
    if (isNullOrEmpty(this._columnFilter)) { return; }
    this._columnFilter.filtersChange.next(this._columnFilter.filters)
  }

  private _setTotalRecordsCount(count: number): void {
    this._dataCountChange.next(count);
  }

  private _resetPaginator(): void {
    if (this._configuration?.applyDefaultPagination) {
      this._dataRecordsChange.next([]);
    }
    if (isNullOrEmpty(this._paginator)) { return; }
    this._paginator.reset();
  }

  private _subscribeToIsInProgressFlag(): void {
    this.isInProgress$ = this._dataStatusChange.pipe(
      takeUntil(this._destroySubject),
      map(status => status === DataStatus.Active ||
        status === DataStatus.PreActive
      ),
      distinctUntilChanged(),
      shareReplay(1)
    );
  }

  private _subscribeToHasNoRecordsFlag(): void {
    this.hasNoRecords$ = this._dataStatusChange.pipe(
      takeUntil(this._destroySubject),
      map(status => status === DataStatus.Empty),
      distinctUntilChanged(),
      shareReplay(1)
    );
  }

  private _subscribeToHasErrorFlag(): void {
    this.hasError$ = this._dataStatusChange.pipe(
      takeUntil(this._destroySubject),
      map(status => status === DataStatus.Error &&
        isNullOrEmpty(this._dataRecordsChange.getValue())),
      distinctUntilChanged(),
      shareReplay(1)
    );
  }

  private _subscribeToDataColumnsChange(): void {
    this.dataColumns$ = this._dataColumnsChange.pipe(
      takeUntil(this._destroySubject),
      distinctUntilChanged(),
      shareReplay(1)
    );
  }

  private _subscribeToDataRecordsChange(): void {
    this.dataRecords$ = this._dataRecordsChange.pipe(
      takeUntil(this._destroySubject),
      distinctUntilChanged(),
      shareReplay(1)
    );
  }

  private _subscribeToTotalCountChange(): void {
    this.totalCount$ = this._dataCountChange.pipe(
      takeUntil(this._destroySubject),
      distinctUntilChanged(),
      shareReplay(1)
    );
  }

  private _subscribeToDisplayedCountChange(): void {
    this.displayedCount$ = this._dataRecordsChange.pipe(
      takeUntil(this._destroySubject),
      map(records => records?.length || 0),
      shareReplay(1)
    );
  }

  private _subscribeToSortingChange(): void {
    this.isSorting$ = this._sortingChange.pipe(
      takeUntil(this._destroySubject),
      distinctUntilChanged(),
      shareReplay(1)
    );
  }
}