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
import { DataStatus } from '@app/models';
import {
  ListPanelConfig,
  Search
} from '@app/shared';
import {
  cloneObject,
  getSafeProperty,
  isNullOrEmpty,
  isNullOrUndefined,
  unsubscribeSafely,
  McsDataSource
} from '@app/utilities';

export class McsListviewConfig<TEntity> {
  constructor(
    public searchPredicate?: (data: TEntity, keyword: string) => boolean,
    public sortPredicate?: (first: TEntity, second: TEntity) => number,
    public panelSettings?: ListPanelConfig
  ) { }
}

export class McsListviewContext<TEntity> {
  constructor(
    public dataRecords: TEntity[],
    public totalCount: number = dataRecords?.length || 0
  ) { }
}

export class McsListviewQueryParam {
  constructor(
    public search: Search
  ) {
  }
}

type DelegateSource<TEntity> = (param?: McsListviewQueryParam) =>
  Observable<McsListviewContext<TEntity>>;

type DatasourceType<TEntity> = McsListviewContext<TEntity> |
  Observable<McsListviewContext<TEntity>> | DelegateSource<TEntity>;

export class McsListviewDataSource2<TEntity> implements McsDataSource<TEntity> {
  public isInProgress$: Observable<boolean>;
  public hasNoRecords$: Observable<boolean>;
  public hasError$: Observable<boolean>;
  public dataRecords$: Observable<TEntity[]>;
  public totalCount$: Observable<number>;
  public displayedCount$: Observable<number>;

  private _search: Search;

  private _dataRecordsChange = new BehaviorSubject<TEntity[]>(null);
  private _dataStatusChange = new BehaviorSubject<DataStatus>(null);
  private _dataCountChange = new BehaviorSubject<number>(0);
  private _requestUpdate = new Subject<void>();

  private _destroySubject = new Subject<void>();
  private _searchSubject = new Subject<void>();

  constructor(
    private _dataSource?: DatasourceType<TEntity>,
    private _config?: McsListviewConfig<TEntity>
  ) {
    this.updateDatasource(_dataSource);
    this._subscribeToIsInProgressFlag();
    this._subscribeToHasNoRecordsFlag();
    this._subscribeToHasErrorFlag();
    this._subscribeToTotalCountChange();
    this._subscribeToDisplayedCountChange();
    this._subscribeToDataRecordsChange();
  }

  public get config(): McsListviewConfig<TEntity> {
    return this._config;
  }

  public connect(_collectionViewer: CollectionViewer): Observable<TEntity[]> {
    return this._dataRecordsChange.pipe(
      filter((records) => records !== null)
    );
  }

  public disconnect(_collectionViewer: CollectionViewer): void {
    unsubscribeSafely(this._destroySubject);

    unsubscribeSafely(this._dataRecordsChange);
    unsubscribeSafely(this._requestUpdate);
    unsubscribeSafely(this._searchSubject);
    unsubscribeSafely(this._dataStatusChange);
    unsubscribeSafely(this._dataCountChange);
  }

  public onCompletion(data?: TEntity[]): void {
    if (!isNullOrEmpty(this._search)) {
      this._search.showLoading(false);
    }
  }

  public dataStatusChange(): Observable<DataStatus> {
    return this._dataStatusChange.asObservable();
  }

  public updateDatasource(newDatasource: DatasourceType<TEntity>): void {
    this._dataSource = newDatasource;
    this._subscribeToRequestUpdate();
  }

  public registerSearch(search: Search): McsListviewDataSource2<TEntity> {
    this._search = search;
    this._subscribeToSearchChange();
    return this;
  }

  public refreshDataRecords(): void {
    this._requestUpdate.next();
    this._dataRecordsChange.next(null);
  }

  private _getDatasourceFunc(): DelegateSource<TEntity> {
    let dataSourceIsPredicate = typeof this._dataSource === 'function';
    return dataSourceIsPredicate ?
      this._dataSource :
      this._convertDatasourceToObservable.bind(this);
  }

  private _convertDatasourceToObservable(): Observable<McsListviewContext<TEntity>> {
    if (isNullOrUndefined(this._dataSource)) { return of(null); }

    return this._dataSource instanceof Observable ?
      this._dataSource :
      of(this._dataSource as any);
  }

  private _subscribeToRequestUpdate(): void {
    this._requestUpdate.pipe(
      startWith([null]),
      takeUntil(this._destroySubject),
      switchMap(() => {
        let datasourceFunc = this._getDatasourceFunc();
        if (isNullOrUndefined(datasourceFunc)) { return of(null); }

        this._dataStatusChange.next(DataStatus.Active);
        let tableParam = new McsListviewQueryParam(this._search);

        return datasourceFunc(tableParam).pipe(
          exhaustMap(response => {
            let dataRecords = getSafeProperty(response, obj => obj.dataRecords) || [];
            let totalRecordsCount = getSafeProperty(response, obj => obj.totalCount) || 0;
            return of(new McsListviewContext(dataRecords, totalRecordsCount));
          }),
          catchError(_error => {
            this._dataStatusChange.next(DataStatus.Error);
            return EMPTY;
          })
        );
      }),
      distinctUntilChanged(),
      debounceTime(300),
      tap(response => {
        if (isNullOrUndefined(response)) { return; }

        this.onCompletion(response.dataRecords);
        this._updateDataRecords(response.dataRecords);
        this._updateTotalRecordsCount(response.totalCount);
        this._dataStatusChange.next(response.totalCount > 0 ?
          DataStatus.Success : DataStatus.Empty
        );
      })
    ).subscribe();
  }

  private _updateDataRecords(records: TEntity[]): void {
    let filteredDataRecords = this._filterDataRecords(records);
    this._dataRecordsChange.next(filteredDataRecords);
  }

  private _filterDataRecords(dataRecords: TEntity[]): TEntity[] {
    let searchedRecords = this._searchDataRecords(dataRecords);
    let sortedRecords = this._sortDataRecords(searchedRecords);
    return sortedRecords;
  }

  private _searchDataRecords(dataRecords: TEntity[]): TEntity[] {
    let hasSearchingMethod = isNullOrEmpty(this._config?.searchPredicate);
    if (hasSearchingMethod) { return dataRecords; }

    // We need to clone the object records to not touch
    // the original instance of the data
    let clonedRecords = cloneObject(dataRecords);
    return clonedRecords.filter(
      (record) => this._config?.searchPredicate(record, this._search?.keyword)
    );
  }

  private _sortDataRecords(dataRecords: TEntity[]): TEntity[] {
    if (isNullOrEmpty(this._config?.sortPredicate)) { return dataRecords; }
    return dataRecords.sort(this._config?.sortPredicate);
  }

  private _updateTotalRecordsCount(count: number): void {
    this._dataCountChange.next(count);
  }

  private _subscribeToSearchChange(): void {
    if (isNullOrEmpty(this._search)) { return; }

    this._searchSubject.next();
    this._search.searchChangedStream.pipe(
      takeUntil(this._searchSubject),
      tap(() => this._requestUpdate.next())
    ).subscribe();
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
}
