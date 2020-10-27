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
import {
  McsDataSource,
  Search
} from '@app/shared';
import {
  isNullOrEmpty,
  isNullOrUndefined,
  unsubscribeSafely
} from '@app/utilities';

type DatasourceFunc<TEntity> = () => Observable<TEntity[]>;
type DatasourceType<TEntity> = TEntity[] | Observable<TEntity[]> | DatasourceFunc<TEntity>;

export class McsListViewDatasource<TEntity> implements McsDataSource<TEntity> {

  private _dataSource: DatasourceFunc<TEntity>;
  private _totalRecordsCount = 0;
  private _dataRecords = new BehaviorSubject<TEntity[]>(null);
  private _dataStatusChange = new BehaviorSubject<DataStatus>(null);

  private _search: Search;
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

  /**
   * Event that emits when the table data has been changed
   */
  public dataStatusChange(): Observable<DataStatus> {
    return this._dataStatusChange.asObservable();
  }

  /**
   * Connects to data records of the listview
   */
  public connect(): Observable<TEntity[]> {
    return this._dataRecords.asObservable().pipe(
      filter((records) => records !== null)
    );
  }

  /**
   * Disconnect all resources of the list view
   */
  public disconnect() {
    unsubscribeSafely(this._dataRecords);
    unsubscribeSafely(this._dataStatusChange);
    unsubscribeSafely(this._searchSubject);
    unsubscribeSafely(this._requestUpdate);
  }

  /**
   * Event that emits when the obtainment of data has been completed
   */
  public onCompletion(_data?: any): void {
    if (!isNullOrEmpty(this._search)) {
      this._search.showLoading(false);
    }
  }

  /**
   * Updates the data source provided on the table
   * @param dataSource New datasource provided
   */
  public updateDatasource(dataSource: DatasourceType<TEntity>): void {
    this._setDataStatus(DataStatus.Active);
    this._setDatasourcePointer(dataSource);
    this.refreshDataRecords();
  }

  /**
   * Registers the search instance to this datasource
   * @param search Search instance to be registered
   */
  public registerSearch(search: Search): McsListViewDatasource<TEntity> {
    this._search = search;
    this._subscribeToSearching();
    return this;
  }

  /**
   * Registers the sort predicate
   */
  public registerSortPredicate(
    predicate: (first: TEntity, second: TEntity) => number
  ): McsListViewDatasource<TEntity> {
    this._sortPredicate = predicate;
    return this;
  }

  /**
   * Refreshes the data records of the source observables
   */
  public refreshDataRecords(): void {
    this._requestUpdate.next();
  }

  /**
   * Sets the data status of the datasource
   */
  private _setDataStatus(dataStatus: DataStatus): void {
    this._dataStatusChange.next(dataStatus);
  }

  /**
   * Sets the datasource function pointer
   */
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

  /**
   * Updates the entity data records
   * @param records Entity records to be updated
   */
  private _updateDataRecords(records: TEntity[]): void {
    this._dataRecords.next(records);
    this._totalRecordsCount = records && records.length;
  }

  /**
   * Filters the data records accordingly
   * @param dataRecords Data records to be filtered
   */
  private _filterData(dataRecords: TEntity[]): TEntity[] {
    let sortedRecords = this._sortRecords(dataRecords);
    return sortedRecords;
  }

  /**
   * Sorts the data records of the provided entities
   * @param dataRecords Data records to be sorted
   */
  private _sortRecords(dataRecords: TEntity[]): TEntity[] {
    if (isNullOrEmpty(this._sortPredicate)) { return dataRecords; }
    return dataRecords.sort(this._sortPredicate);
  }

  /**
   * Subscribes to searching of data records
   */
  private _subscribeToSearching(): void {
    if (isNullOrEmpty(this._search)) { return; }

    this._searchSubject.next();
    this._search.searchChangedStream.pipe(
      takeUntil(this._searchSubject)
    ).subscribe(() => this.refreshDataRecords());
  }

  /**
   * Subscribes to request changes for rendering datasource
   */
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
