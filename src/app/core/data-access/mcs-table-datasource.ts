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
import { McsRepository } from '@app/services';
import {
  McsDataSource,
  Paginator,
  Search
} from '@app/shared';
import {
  isNullOrEmpty,
  isNullOrUndefined,
  unsubscribeSafely,
  CommonDefinition
} from '@app/utilities';

type DelegateSource<T> = () => Observable<T[]>;
type DatasourceType<T> = McsRepository<T> | T[] | Observable<T[]> | DelegateSource<T>;

export class McsTableDataSource<T> implements McsDataSource<T> {
  public dataStatus: DataStatus;

  private _paginator: Paginator;
  private _search: Search;
  private _searchPredicate: (data: T, keyword: string) => boolean;

  private _totalRecordsCount: number;
  private _datasourceFuncPointer: DelegateSource<T>;
  private _dataRecords = new BehaviorSubject<T[]>(null);
  private _dataRenderedChange = new BehaviorSubject<T[]>(null);
  private _dataStatusChange = new BehaviorSubject<DataStatus>(null);
  private _requestUpdate = new Subject<void>();
  private _searchSubject = new Subject<void>();
  private _pagingSubject = new Subject<void>();
  private _dataChangeSubject = new Subject<void>();

  constructor(private _dataSource?: DatasourceType<T>) {
    this._totalRecordsCount = 0;

    this.updateDatasource(_dataSource);
    this._subscribeToRequestChange();
    this._subscribeToRepoDataChange();
  }

  /**
   * Updates the data source provided on the table
   * @param dataSource New datasource provided
   */
  public updateDatasource(dataSource: DatasourceType<T>): void {
    this._dataSource = dataSource;
    this.updateDataStatus(DataStatus.Active);
    this._setDatasourcePointer();
    this.refreshDataRecords();
  }

  /**
   * Updates the data status of the table
   * @param state State of the table to be set
   */
  public updateDataStatus(state: DataStatus): void {
    this.dataStatus = state;
    this._dataStatusChange.next(state);
  }

  /**
   * Registers the paginator instance to this datasource
   * @param paginator Paginator instance to be registered
   */
  public registerPaginator(paginator: Paginator): McsTableDataSource<T> {
    this._paginator = paginator;
    this._subscribeToPaging();
    return this;
  }

  /**
   * Registers the search instance to this datasource
   * @param search Search instance to be registered
   */
  public registerSearch(search: Search): McsTableDataSource<T> {
    this._search = search;
    this._subscribeToSearching();
    return this;
  }

  /**
   * Registers the search predicate to this datasource, and
   * this would only work once your datasource was not predicate/repository
   * @param predicate Predicate to be registered
   */
  public registerSearchPredicate(
    predicate: (data: T, keyword: string) => boolean
  ): McsTableDataSource<T> {
    this._searchPredicate = predicate;
    return this;
  }

  /**
   * Connect function called by the table to retrieve
   * one stream containing the data to render.
   */
  public connect(): Observable<T[]> {
    return this._dataRecords.asObservable().pipe(
      filter((records) => records !== null)
    );
  }

  /**
   * Destroy all objects from the current connection
   * and return all the record to its original value
   */
  public disconnect() {
    unsubscribeSafely(this._dataRecords);
    unsubscribeSafely(this._dataRenderedChange);
    unsubscribeSafely(this._requestUpdate);
    unsubscribeSafely(this._searchSubject);
    unsubscribeSafely(this._pagingSubject);
    unsubscribeSafely(this._dataChangeSubject);
    unsubscribeSafely(this._dataStatusChange);
    this._resetPaginator();
  }

  /**
   * An event that emits when the datasource finished the obtainment
   * @param status Status of the datasource
   */
  public onCompletion(_data?: any): void {
    if (!isNullOrEmpty(this._search)) {
      this._search.showLoading(false);
    }
    if (!isNullOrEmpty(this._paginator)) {
      this._paginator.showLoading(false);
    }
  }

  /**
   * Event that emits when the table data has been changed
   */
  public dataStatusChange(): Observable<DataStatus> {
    return this._dataStatusChange.asObservable();
  }

  /**
   * Event that emits when the data was rendered on the datasource has been changed.
   * This won't trigger when adding or deleting records from the table
   */
  public dataRenderedChange(): Observable<T[]> {
    return this._dataRenderedChange.asObservable().pipe(
      filter((records) => records !== null)
    );
  }

  /**
   * Returns the datarecords of the datasource once obtained
   */
  public get dataRecords(): T[] {
    return this._dataRecords.getValue() || [];
  }

  /**
   * Returns the total records count of the data records
   */
  public get totalRecordsCount(): number {
    return Math.max(this._totalRecordsCount, 0);
  }

  /**
   * Refreshes the data records of the table
   */
  public refreshDataRecords(): void {
    this._resetPaginator();
    this._requestUpdate.next();
  }

  /**
   * Data source function pointer
   */
  private _datasourceFunc(): Observable<T[]> {
    // Return immediately when it is null
    if (isNullOrUndefined(this._dataSource)) { return of(null); }
    if (this._dataSource instanceof Observable) {
      return this._dataSource;
    } else if (this._dataSource instanceof Array) {
      return of(this._dataSource);
    }

    return !isNullOrUndefined(this._dataSource) && (this._dataSource as McsRepository<T>).filterBy({
      keyword: this._search && this._search.keyword || '',
      pageIndex: this._paginator && this._paginator.pageIndex || CommonDefinition.DEFAULT_PAGE_INDEX,
      pageSize: this._paginator && this._paginator.pageSize || CommonDefinition.DEFAULT_PAGE_SIZE
    });
  }

  /**
   * Returns true once the datasource is a repository type
   */
  private get _datasourceIsRepository(): boolean {
    return !isNullOrUndefined(this._dataSource) &&
      (this._dataSource as any).filterBy !== undefined;
  }

  /**
   * Returns true once the datasource is a predicate type
   */
  private get _datasourceIsPredicate(): boolean {
    return typeof this._dataSource === 'function';
  }

  /**
   * Subscribe to searching to update the rendering
   */
  private _subscribeToSearching(): void {
    if (isNullOrEmpty(this._search)) { return; }
    this._searchSubject.next();
    this._search.searchChangedStream
      .pipe(takeUntil(this._searchSubject))
      .subscribe(() => this.refreshDataRecords());
  }

  /**
   * Subscribe to paging to update the rendering
   */
  private _subscribeToPaging(): void {
    if (isNullOrEmpty(this._paginator)) { return; }
    this._pagingSubject.next();
    this._paginator.pageChangedStream
      .pipe(takeUntil(this._pagingSubject))
      .subscribe(() => this._requestUpdate.next());
  }

  /**
   * Subscribe to request changes for rendering datasource
   */
  private _subscribeToRequestChange(): void {
    this._requestUpdate.pipe(
      startWith(null as void),
      switchMap(() => {
        this.updateDataStatus(DataStatus.Active);

        return this._datasourceFuncPointer().pipe(
          exhaustMap((records) => of(this._filterData(records))),
          catchError((error) => {
            this.updateDataStatus(DataStatus.Error);
            return throwError(error);
          })
        );
      })
    ).subscribe((response) => {
      if (isNullOrUndefined(this._dataSource)) { return; }

      this._updateDataRecords(response);
      this._setTotalRecordsCountByContext(response);
      this._dataRenderedChange.next(response);
      this.updateDataStatus(isNullOrEmpty(response) ? DataStatus.Empty : DataStatus.Success);
      this.onCompletion(response);
    });
  }

  /**
   * Subscribe to repository data change and emit those changes once the
   * a new record has been added or one the records of data source has been deleted
   */
  private _subscribeToRepoDataChange(): void {
    if (!this._datasourceIsRepository) { return; }
    (this._dataSource as McsRepository<T>).dataClear().pipe(
      takeUntil(this._dataChangeSubject)
    ).subscribe(() => this._requestUpdate.next());
  }

  /**
   * Sets the datasource function pointer
   */
  private _setDatasourcePointer(): void {
    this._datasourceFuncPointer = this._datasourceIsPredicate ?
      this._dataSource as any : this._datasourceFunc.bind(this);
  }

  /**
   * Reset the paginator to its initial state
   */
  private _resetPaginator(): void {
    if (isNullOrEmpty(this._paginator)) { return; }
    this._paginator.reset();
  }

  /**
   * Filters the data by query provided
   * @param dataRecords Datarecords to be filtered
   */
  private _filterData(dataRecords: T[]): T[] {
    let searchedData = this._searchData(dataRecords);
    let pagedData = this._pageData(searchedData);
    return pagedData;
  }

  /**
   * Returns the searched datarecords
   * @param dataRecords Datarecords to be searched
   */
  private _searchData(dataRecords: T[]): T[] {
    // Searching is already covered on the repository interface
    let hasSearchingMethod = this._datasourceIsPredicate ||
      this._datasourceIsRepository || isNullOrEmpty(this._search);
    if (hasSearchingMethod) { return dataRecords; }

    if (isNullOrEmpty(this._searchPredicate)) {
      throw new Error('Search predicate was not defined.');
    }
    return dataRecords.filter((record) => this._searchPredicate(record, this._search.keyword));
  }

  /**
   * Returns the paged datarecords
   * @param dataRecords Datarecords to be searched
   */
  private _pageData(dataRecords: T[]): T[] {
    // Paging is already covered on the repository interface
    let hasPagingMethod = this._datasourceIsPredicate ||
      this._datasourceIsRepository || isNullOrEmpty(this._paginator);
    if (hasPagingMethod) { return dataRecords; }

    let totalRecordsToPull = this._paginator.pageIndex * this._paginator.pageSize;
    return dataRecords.slice().splice(0, totalRecordsToPull);
  }

  /**
   * Sets the total record count by context provided
   * @param records Records to get the count from
   */
  private _setTotalRecordsCountByContext(records: T[]): void {
    this._totalRecordsCount = this._datasourceIsRepository ?
      (this._dataSource as McsRepository<T>).getTotalRecordsCount() :
      records.length;
  }

  /**
   * Updates the datarecords based on the new records provided
   * @param records Records to be updated
   */
  private _updateDataRecords(records: T[]): void {
    this._dataRecords.next(records);
  }
}
