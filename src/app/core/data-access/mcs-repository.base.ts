import {
  Observable,
  of,
  Subject
} from 'rxjs';
import {
  McsEntityBase,
  McsQueryParam
} from '@app/models';
import {
  tap,
  switchMap,
  finalize
} from 'rxjs/operators';
import {
  addOrUpdateArrayRecord,
  mergeArrays,
  deleteArrayRecord,
  isNullOrEmpty,
  clearArrayRecord,
  getSafeProperty,
  McsEventHandler
} from '@app/utilities';
import { McsRepository } from './mcs-repository.interface';
import { McsDataContext } from './mcs-data-context.interface';

export abstract class McsRepositoryBase<T extends McsEntityBase>
  implements McsRepository<T>, McsEventHandler {

  public eventResetSubject = new Subject<void>();
  protected dataRecords = new Array<T>();
  protected filteredRecords = new Array<T>();

  // Other variables
  private _getByRecordIds = new Array<string>();
  private _allRecordsCount: number = 0;
  private _previouslySearched: string = '';

  // Events notifier for live data refresh on the view per subscription
  private _dataContextChange = new Subject<void>();
  private _dataChange = new Subject<T[]>();

  constructor(private _context: McsDataContext<T>) {
    this._subscribeToDataContextChange();
  }

  /**
   * Get all records from the repository and creates a new observable
   * if the records has been changed the observers will be notified
   */
  public getAll(): Observable<T[]> {
    let allRecordsObserver = this._recordIsMax ?
      this._getAllRecordsFromCache() :
      this._getAllRecordsFromContext();

    return allRecordsObserver.pipe(
      switchMap(() => of(this.dataRecords)),
      finalize(() => this._notifyDataChange())
    );
  }

  /**
   * Filter the records from the repository based on the predicate provided
   * and creates a new observable if the records has been changed the
   * observers will be notified
   * @param query Query of the records to be filtered
   */
  public filterBy(query: McsQueryParam): Observable<T[]> {
    let filteredRecords: Observable<T[]>;

    // Filter records by search keyword query and return the record immediately.
    // The searching would always look on the context and not on the cache
    let searchKeywordIsDifferent = this._previouslySearched !== query.keyword;
    if (searchKeywordIsDifferent) { this.filteredRecords = new Array(); }
    this._previouslySearched = query.keyword;

    let isSearching = !isNullOrEmpty(query.keyword);
    filteredRecords = isSearching ?
      this._filterRecordsBySearchQuery(query) :
      this._filterRecordsByPageQuery(query);

    return filteredRecords.pipe(
      switchMap(() => of(this.filteredRecords)),
      finalize(() => this._notifyDataChange())
    );
  }

  /**
   * Get the record based on the identity provided and
   * creates a new observable if the data of the record has been changed
   * the observer will be notified
   * @param id Id of the record to be obtained
   */
  public getById(id: string): Observable<T> {
    let recordFound = this.dataRecords.find((item) => item.id === id);
    let getByIdObserver = !isNullOrEmpty(recordFound) ?
      this._getRecordByIdFromCache(id) :
      this._getRecordByIdFromContext(id);

    return getByIdObserver.pipe(
      switchMap(() => of(this.dataRecords.find((record) => record.id === id))),
      finalize(() => this._notifyDataChange())
    );
  }

  /**
   * Get the record based on the predicate provided and
   * creates a new observable if the data of the record has been changed
   * the observer will be notified
   * @param predicate Predicate of the item that returns true if the record should be obtained
   */
  public getBy(predicate: (entity: T) => boolean): Observable<T> {
    let foundItem = this.dataRecords.find((item) => predicate(item));
    return of(foundItem).pipe(
      finalize(() => this._notifyDataChange())
    );
  }

  /**
   * Add a new record to the repository
   * @param entity Entity to be added
   */
  public addOrUpdate(entity: T): void {
    this.dataRecords = addOrUpdateArrayRecord(
      this.dataRecords, entity, false,
      (currentRecord: T) => currentRecord.id === entity.id
    );
    this._notifyDataChange();
  }

  /**
   * Delete a record to the repository
   * @param entity Entity to be deleted
   */
  public delete(entity: T): void {
    this.dataRecords = deleteArrayRecord(this.dataRecords,
      (item) => item.id === entity.id);
    this._notifyDataChange();
  }

  /**
   * Delete a record to the repository
   * @param id id of the entity to be deleted
   */
  public deleteById(id: string): void {
    this.dataRecords = deleteArrayRecord(this.dataRecords, (item) => item.id === id);
    this._getByRecordIds = deleteArrayRecord(this._getByRecordIds, (itemId) => itemId === id);
    this._notifyDataChange();
  }

  /**
   * An observable event that emits whenever there are changes on the repository data
   */
  public dataChange(): Observable<T[]> {
    return this._dataChange.asObservable();
  }

  /**
   * Sort Records based on predicate definition
   * @param predicate Predicate definition to be the method of sorting
   */
  public sortRecords(predicate: (first: T, second: T) => number) {
    this.dataRecords.sort(predicate);
    this._notifyDataChange();
  }

  /**
   * Returns the total record count from the context
   */
  public getTotalRecordCount(): number {
    return this._context.totalRecordCount;
  }

  /**
   * Clears the cache data and it will not notify the dataChange event
   */
  public clearCache(): void {
    this._context.totalRecordCount = 0;
    clearArrayRecord(this.dataRecords);
    clearArrayRecord(this.filteredRecords);
    this._notifyDataChange();
  }

  /**
   * Updates the record property according to its structure,
   * if the record is array, it will automatically appended and will not remove
   * the previous instance of the array, and same thing with the object.
   * @param propertyTarget The target object to copy to.
   * @param propertySource The source object from which to copy records.
   */
  public updateRecordProperty<P>(propertyTarget: P | any, propertySource: P | any): P | any {
    let objectIsArrayType = Array.isArray(propertySource) || Array.isArray(propertyTarget);

    if (objectIsArrayType) {
      let mergeMethod = (_first: McsEntityBase, _second: McsEntityBase) => _first.id === _second.id;
      let mergedRecords = mergeArrays(propertyTarget, propertySource, mergeMethod)
        .filter((_record) => {
          return !isNullOrEmpty(propertySource
            .find((sourceRecord) => sourceRecord.id === _record.id));
        });
      propertyTarget = Object.assign(mergedRecords);
    } else {
      propertyTarget = Object.assign(propertySource);
    }
    return propertyTarget;
  }

  /**
   * Registers all the associated events on the interited class
   */
  public registerEvents(): void {
    // Do implementations outside
  }

  /**
   * Returns true when the record is already at maximum
   */
  private get _recordIsMax(): boolean {
    if (this.getTotalRecordCount() < 1) { return false; }
    return this.dataRecords.length >= this.getTotalRecordCount();
  }

  /**
   * Filters the records from the context based on the query
   * @param query Query to be filtered in the repository
   */
  private _pageRecordsFromContext(query: McsQueryParam): Observable<T[]> {
    return this._context.filterRecords(query).pipe(
      tap((newFilteredRecords) => {
        this._allRecordsCount = this._context.totalRecordCount;
        this._mergeNewRecordsToCache(...newFilteredRecords);
        this.filteredRecords.push(...newFilteredRecords);
      }),
      finalize(() => this._dataContextChange.next())
    );
  }

  /**
   * Filters the records from the cache based on the query
   * @param query Query to be filtered in the repository
   */
  private _pageRecordsFromCache(query: McsQueryParam): Observable<T[]> {
    let maxRecordsToPull = Math.min(
      query.pageIndex * query.pageSize,
      this.dataRecords.length
    );
    let pageData = this.dataRecords.slice();
    let actualData = pageData.splice(0, maxRecordsToPull);
    return of(actualData).pipe(
      tap((newFilteredRecords) => this.filteredRecords = newFilteredRecords)
    );
  }

  /**
   * Searched the records by search query
   * @param query Query on how the records will be filtered
   */
  private _filterRecordsBySearchQuery(query: McsQueryParam): Observable<T[]> {
    let searchedRecords = this._context.filterRecords(query).pipe(
      tap((newFilteredRecords) => {
        let recordsInstance: T[] = [];
        // Get the original instance of the records from cache
        newFilteredRecords.forEach((filteredRecord) => {
          let recordFound = this.dataRecords.find((record) => record.id === filteredRecord.id);
          isNullOrEmpty(recordFound) ?
            recordsInstance.push(filteredRecord) :
            recordsInstance.push(recordFound);
        });
        this.filteredRecords.push(...recordsInstance);
      }),
      finalize(() => this._dataContextChange.next())
    );
    return searchedRecords;
  }

  /**
   * Page the records by page query
   * @param query Query on how the records will be filtered
   */
  private _filterRecordsByPageQuery(query: McsQueryParam): Observable<T[]> {
    let recordsCountToPull = query.pageSize * query.pageIndex;
    let currentRecordCount = this.dataRecords.length;
    let requestRecordFromCache = this._recordIsMax || (currentRecordCount >= recordsCountToPull);

    let filterByObserver = requestRecordFromCache ?
      this._pageRecordsFromCache(query) :
      this._pageRecordsFromContext(query);

    return filterByObserver.pipe(
      tap(() => this._context.totalRecordCount = this._allRecordsCount)
    );
  }

  /**
   * Get all records from cache
   */
  private _getAllRecordsFromCache(): Observable<T[]> {
    return of(this.dataRecords);
  }

  /**
   * Get all records from data context, and append it to the datasource
   */
  private _getAllRecordsFromContext(): Observable<T[]> {
    return this._context.getAllRecords().pipe(
      tap((newRecords) => {
        this._allRecordsCount = this._context.totalRecordCount;
        this._mergeNewRecordsToCache(...newRecords);
      })
    );
  }

  /**
   * Get record by ID from cached data
   * @param id Id of the record to obtain
   */
  private _getRecordByIdFromCache(id: string): Observable<T> {
    this._context.getRecordById(id).subscribe((item) => {
      this._mergeNewRecordsToCache(item);
      this._notifyDataChange();
    });
    return of(this.dataRecords.find((item) => item.id === id));
  }

  /**
   * Get record by ID from context data
   * @param id Id of the record to obtain
   */
  private _getRecordByIdFromContext(id: string): Observable<T> {
    return this._context.getRecordById(id).pipe(
      tap((item) => {
        this._getByRecordIds.push(item.id);
        this._mergeNewRecordsToCache(item);
      }),
      finalize(() => this._dataContextChange.next())
    );
  }

  /**
   * Notifies the datarecords changes event
   */
  private _notifyDataChange(): void {
    this._dataChange.next(this.dataRecords);
  }

  /**
   * Merge the new records to the cached datasource, if the record
   * is already exist, the instance will be remained
   */
  private _mergeNewRecordsToCache(...newItems: T[]): void {
    this.dataRecords = mergeArrays(
      this.dataRecords, newItems,
      (firstRecord: T, secondRecord: T) => firstRecord.id === secondRecord.id
    );
  }

  /**
   * Subscribes to after obtained data observabled
   */
  private _subscribeToDataContextChange(): void {
    // We need to reset the subscriptions of the reset subject
    // in order to reregister and obtain the fresh data
    // once the data was obtained from API
    this._dataContextChange.subscribe(() => {
      let alreadyRegistered = !isNullOrEmpty(
        getSafeProperty(this.eventResetSubject, (obj) => obj.observers.length)
      );
      if (alreadyRegistered) { return; }
      // Drop the current subscription to prevent memory leak.
      this.eventResetSubject.next();
      this.registerEvents();
    });
  }
}
