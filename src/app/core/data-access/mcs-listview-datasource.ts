import {
  of,
  throwError,
  BehaviorSubject,
  Observable,
  Subject
} from 'rxjs';
import {
  catchError,
  exhaustMap,
  filter,
  startWith,
  switchMap,
  takeUntil
} from 'rxjs/operators';

import { DataStatus } from '@app/models';
import { Search } from '@app/shared';
import {
  cloneObject,
  isNullOrEmpty,
  isNullOrUndefined,
  unsubscribeSafely,
  McsDataSource
} from '@app/utilities';

type DatasourceFunc<TEntity> = () => Observable<TEntity[]>;
type DatasourceType<TEntity> = TEntity[] | Observable<TEntity[]> | DatasourceFunc<TEntity>;

export class McsListViewDatasource<TEntity> implements McsDataSource<TEntity> {

  private _dataSource: DatasourceFunc<TEntity>;
  private _totalRecordsCount = 0;
  private _dataRecords = new BehaviorSubject<TEntity[]>(null);
  private _dataStatusChange = new BehaviorSubject<DataStatus>(null);

  private _search: Search;
  private _searchPredicate: (data: TEntity, keyword: string) => boolean;

  private _searchSubject = new Subject<void>();
  private _requestUpdate = new Subject<void>();
  private _sortPredicate: (first: TEntity, second: TEntity) => number;

  constructor(dataSource?: DatasourceType<TEntity>) {
    this.updateDatasource(dataSource);
    this._subscribeToRequestChange();
  }

  public get totalRecordsCount(): number {
    return Math.max(this._totalRecordsCount, 0);
  }

  public dataStatusChange(): Observable<DataStatus> {
    return this._dataStatusChange.asObservable();
  }

  public connect(): Observable<TEntity[]> {
    return this._dataRecords.asObservable().pipe(
      filter((records) => records !== null)
    );
  }

  public disconnect() {
    unsubscribeSafely(this._dataRecords);
    unsubscribeSafely(this._dataStatusChange);
    unsubscribeSafely(this._searchSubject);
    unsubscribeSafely(this._requestUpdate);
  }

  public onCompletion(_data?: any): void {
    if (!isNullOrEmpty(this._search)) {
      this._search.showLoading(false);
    }
  }

  public updateDatasource(dataSource: DatasourceType<TEntity>): void {
    this._setDataStatus(DataStatus.Active);
    this._setDatasourcePointer(dataSource);
    this.refreshDataRecords();
  }

  public registerSearch(search: Search): McsListViewDatasource<TEntity> {
    this._search = search;
    this._subscribeToSearching();
    return this;
  }

  public registerSearchPredicate(
    predicate: (data: TEntity, keyword: string) => boolean
  ): McsListViewDatasource<TEntity> {
    this._searchPredicate = predicate;
    return this;
  }

  public registerSortPredicate(
    predicate: (first: TEntity, second: TEntity) => number
  ): McsListViewDatasource<TEntity> {
    this._sortPredicate = predicate;
    return this;
  }

  public refreshDataRecords(): void {
    this._requestUpdate.next();
  }

  private _setDataStatus(dataStatus: DataStatus): void {
    this._dataStatusChange.next(dataStatus);
  }

  private _setDatasourcePointer(dataSource: DatasourceType<TEntity>): void {
    if (isNullOrUndefined(dataSource)) { return; }

    if (typeof dataSource === 'function') {
      this._dataSource = dataSource.bind(this);
      return;
    }
    this._dataSource = Array.isArray(dataSource) ?
      () => of(dataSource) :
      () => dataSource;
  }

  private _updateDataRecords(records: TEntity[]): void {
    this._dataRecords.next(records);
    this._totalRecordsCount = records && records.length;
  }

  private _filterData(dataRecords: TEntity[]): TEntity[] {
    let searchedRecords = this._searchData(dataRecords);
    let sortedRecords = this._sortRecords(searchedRecords);
    return sortedRecords;
  }

  private _searchData(dataRecords: TEntity[]): TEntity[] {
    let hasSearchingMethod = isNullOrEmpty(this._searchPredicate);
    if (hasSearchingMethod) { return dataRecords; }

    // We need to clone the object records to not touch
    // the original instance of the data
    let clonedRecords = cloneObject(dataRecords);
    return clonedRecords.filter((record) => this._searchPredicate(record, this._search.keyword));
  }

  private _sortRecords(dataRecords: TEntity[]): TEntity[] {
    if (isNullOrEmpty(this._sortPredicate)) { return dataRecords; }
    return dataRecords.sort(this._sortPredicate);
  }

  private _subscribeToSearching(): void {
    if (isNullOrEmpty(this._search)) { return; }

    this._searchSubject.next();
    this._search.searchChangedStream.pipe(
      takeUntil(this._searchSubject)
    ).subscribe(() => this.refreshDataRecords());
  }

  private _subscribeToRequestChange(): void {
    this._requestUpdate.pipe(
      startWith(null as void),
      filter(() => !isNullOrUndefined(this._dataSource)),
      switchMap(() => {
        this._setDataStatus(DataStatus.Active);

        return this._dataSource().pipe(
          exhaustMap((records) => of(this._filterData(records))),
          catchError((error) => {
            this._setDataStatus(DataStatus.Error);
            return throwError(error);
          })
        );
      })
    ).subscribe((response) => {
      this._updateDataRecords(response);
      this._setDataStatus(isNullOrEmpty(response) ? DataStatus.Empty : DataStatus.Success);
      this.onCompletion(response);
    });
  }
}
