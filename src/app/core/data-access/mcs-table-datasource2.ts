import {
  of,
  BehaviorSubject,
  EMPTY,
  Observable,
  Subject
} from 'rxjs';
import {
  catchError,
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
  getSafeProperty,
  isNullOrEmpty,
  isNullOrUndefined,
  unsubscribeSafely,
  CommonDefinition,
  McsDataSource
} from '@app/utilities';

export class McsMatTableContext<TEntity> {
  constructor(
    public dataRecords: TEntity[],
    public totalCount: number = dataRecords?.length || 0
  ) { }
}

export class McsMatTableQueryParam {
  constructor(
    public search: Search,
    public paginator: Paginator
  ) {
    if (isNullOrEmpty(this.paginator)) {
      this.paginator = Object.create({});
      this.paginator.pageIndex = CommonDefinition.PAGE_INDEX_DEFAULT;
      this.paginator.pageSize = CommonDefinition.PAGE_SIZE_MIN;
    }
  }
}

type DelegateSource<TEntity> = (param?: McsMatTableQueryParam) =>
  Observable<McsMatTableContext<TEntity>>;

type DatasourceType<TEntity> = McsMatTableContext<TEntity> |
  Observable<McsMatTableContext<TEntity>> | DelegateSource<TEntity>;

export class McsTableDataSource2<TEntity> implements McsDataSource<TEntity> {
  public dataColumns$: Observable<string[]>;
  public isInProgress$: Observable<boolean>;
  public hasNoRecords$: Observable<boolean>;
  public hasError$: Observable<boolean>;
  public dataRecords$: Observable<TEntity[]>;
  public totalCount$: Observable<number>;

  private _columnFilter: ColumnFilter;
  private _search: Search;
  private _paginator: Paginator;

  private _datasourceFunc: DelegateSource<TEntity>;
  private _dataRecordsChange = new BehaviorSubject<TEntity[]>(null);
  private _dataColumnsChange = new BehaviorSubject<string[]>(null);
  private _dataStatusChange = new BehaviorSubject<DataStatus>(null);
  private _dataCountChange = new BehaviorSubject<number>(0);
  private _requestUpdate = new Subject<void>();

  private _destroySubject = new Subject<void>();
  private _searchSubject = new Subject<void>();
  private _pageSubject = new Subject<void>();
  private _columnSelectorSubject = new Subject<void>();

  constructor(dataSource?: DatasourceType<TEntity>) {
    this.updateDatasource(dataSource);
    this._subscribeToIsInProgressFlag();
    this._subscribeToHasNoRecordsFlag();
    this._subscribeToHasErrorFlag();
    this._subscribeToTotalCountChange();
    this._subscribeToDataRecordsChange();
    this._subscribeToDataColumnsChange();
  }

  public connect(_collectionViewer: CollectionViewer): Observable<TEntity[]> {
    return this._dataRecordsChange.asObservable().pipe(
      filter((records) => records !== null)
    );
  }

  public disconnect(_collectionViewer: CollectionViewer): void {
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
    this._requestUpdate.next();
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
          .map(item => item.id);

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

  private _subscribeToRequestUpdate(): void {
    this._requestUpdate.pipe(
      startWith([null]),
      takeUntil(this._destroySubject),
      switchMap(() => {
        this._dataStatusChange.next(DataStatus.Active);
        let tableParam = new McsMatTableQueryParam(this._search, this._paginator);

        return this._datasourceFunc(tableParam).pipe(
          exhaustMap(response => {
            let dataRecords = getSafeProperty(response, obj => obj.dataRecords) || [];
            let totalRecordsCount = getSafeProperty(response, obj => obj.totalCount) || 0;
            return of(new McsMatTableContext(dataRecords, totalRecordsCount));
          }),
          catchError(_error => {
            this._dataStatusChange.next(DataStatus.Error);
            return EMPTY;
          })
        );
      })
    ).subscribe(response => {
      if (isNullOrUndefined(this._datasourceFunc)) { return; }

      this.onCompletion(response.dataRecords);
      this._updateDataRecords(response.dataRecords);
      this._setTotalRecordsCount(response.totalCount);
      this._dataStatusChange.next(response.totalCount > 0 ?
        DataStatus.Success : DataStatus.Empty);
    });
  }

  private _updateDataRecords(records: TEntity[]): void {
    this._dataRecordsChange.next(records);
  }

  private _setTotalRecordsCount(count: number): void {
    this._dataCountChange.next(count);
  }

  private _resetPaginator(): void {
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
      map(status => status === DataStatus.Error),
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
}