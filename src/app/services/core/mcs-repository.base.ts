import {
  Observable,
  of,
  Subject,
  BehaviorSubject
} from 'rxjs';
import {
  McsEntityBase,
  McsQueryParam
} from '@app/models';
import {
  tap,
  switchMap,
  finalize,
  filter
} from 'rxjs/operators';
import {
  addOrUpdateArrayRecord,
  mergeArrays,
  deleteArrayRecord,
  isNullOrEmpty,
  clearArrayRecord
} from '@app/utilities';
import { McsRepository } from './mcs-repository.interface';
import { McsDataContext } from './mcs-data-context.interface';
import { EventBusDispatcherService } from '@peerlancers/ngx-event-bus';
import { McsEvent } from '@app/events';

export abstract class McsRepositoryBase<T extends McsEntityBase> implements McsRepository<T> {

  protected dataRecords = new Array<T>();
  protected filteredRecords = new Array<T>();

  // Other variables
  private _allRecordsCount: number = 0;
  private _previouslySearched: string = '';
  private _detailedItems: Set<string> = new Set();

  // Events notifier for live data refresh on the view per subscription
  private _dataClear = new Subject<void>();
  private _dataChange = new BehaviorSubject<T[]>(null);

  constructor(
    private _context: McsDataContext<T>,
    private _eventDispatcher: EventBusDispatcherService = null) { }

  /**
   * Get all records from the repository and creates a new observable
   * if the records has been changed the observers will be notified
   */
  public getAll(): Observable<T[]> {
    let allRecordsObserver = this._allRecordsAreLoaded ?
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

    let isSearching = !isNullOrEmpty(query.keyword) || searchKeywordIsDifferent;
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
    return this._getRecordByIdFromContext(id).pipe(
      switchMap(() => of(this.dataRecords.find((record) => record.id === id))),
      finalize(() => this._notifyDataChange())
    );
  }

  /**
   * Get the record from the current datasource based on the predicate provided
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
   * @param insertIndex Index position on where to insert the record
   */
  public addOrUpdate(entity: T, insertIndex?: number): void {
    if (isNullOrEmpty(entity)) { return; }

    let isUpdate = !!this.dataRecords.find((item) => item.id === entity.id);
    this.dataRecords = addOrUpdateArrayRecord(
      this.dataRecords, entity, false,
      (currentEntity: T) => currentEntity.id === entity.id,
      insertIndex
    );

    if (!isUpdate) {
      this._notifyDataChange();
      if (!isNullOrEmpty(this._allRecordsCount)) { ++this._allRecordsCount; }
    } else {
      this._notifyDataChange();
    }
  }

  /**
   * Delete a record from the repository based on the entity provided
   * @param entity Entity to be deleted
   */
  public delete(entity: T): void {
    if (isNullOrEmpty(entity)) { return; }

    let deletePredicate = (item: T) => item.id === entity.id;
    this.deleteBy(deletePredicate);
  }

  /**
   * Delete a record from the repository based on the id provided
   * @param id id of the entity to be deleted
   */
  public deleteById(id: string): void {
    let deletePredicate = (item: T) => item.id === id;
    this.deleteBy(deletePredicate);
  }

  /**
   * Delete a record from the repository based on the predicate definition
   * @param predicate Predicate definition on which to delete the record
   */
  public deleteBy(predicate: (entity: T) => boolean) {
    this.dataRecords = deleteArrayRecord(this.dataRecords, predicate);
    this.filteredRecords = deleteArrayRecord(this.filteredRecords, predicate);
    --this._allRecordsCount;
    this._notifyDataChange();
  }

  /**
   * An observable event that emits when the data has been changed
   */
  public dataChange(): Observable<T[]> {
    return this._dataChange.asObservable().pipe(
      filter((response) => !isNullOrEmpty(response))
    );
  }

  /**
   * An observable event that emits when the data has been cleared
   */
  public dataClear(): Observable<void> {
    return this._dataClear.asObservable();
  }

  /**
   * Sort Records based on predicate definition
   * @param predicate Predicate definition to be the method of sorting
   */
  public sortRecords(predicate: (first: T, second: T) => number): void {
    this.dataRecords.sort(predicate);
    this._notifyDataChange();
  }

  /**
   * Returns the total record count from the context
   */
  public getTotalRecordsCount(): number {
    return this._allRecordsCount;
  }

  /**
   * Clears the cache data and it will not notify the dataChange event
   */
  public clearData(): void {
    this._context.totalRecordsCount = 0;
    this._allRecordsCount = 0;
    clearArrayRecord(this.dataRecords);
    clearArrayRecord(this.filteredRecords);
    this._dataClear.next();
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
   * Returns true when all records are loaded
   */
  private get _allRecordsAreLoaded(): boolean {
    if (this.getTotalRecordsCount() < 1) { return false; }
    return this.dataRecords.length >= this.getTotalRecordsCount();
  }

  /**
   * Filters the records from the context based on the query
   * @param query Query to be filtered in the repository
   */
  private _pageRecordsFromContext(query: McsQueryParam): Observable<T[]> {
    return this._context.filterRecords(query).pipe(
      tap((newFilteredRecords) => {
        this._allRecordsCount = this._context.totalRecordsCount;
        this._updateFilteredRecords(newFilteredRecords);
        this._cacheRecords(...newFilteredRecords);

        this._sendRecordsUpdateNotice();
      })
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
        this._allRecordsCount = this._context.totalRecordsCount;
        this._updateFilteredRecords(newFilteredRecords);
      })
    );

    this._sendRecordsUpdateNotice();

    return searchedRecords;
  }

  private _sendRecordsUpdateNotice() {
    if (!isNullOrEmpty(this._eventDispatcher)) {
      this._eventDispatcher.dispatch(McsEvent.newRecordsRetrieved);
    }
  }

  /**
   * Updates the filter records based on the new record provided and
   * it will get their corresponding instances once the record exist.
   * @param recordsFromContext New Records from context obtainment
   */
  private _updateFilteredRecords(recordsFromContext: T[]): void {
    let recordsInstance: T[] = [];

    // Get the original instance of the records from cache
    recordsFromContext.forEach((filteredRecord) => {
      let recordFound = this.dataRecords.find((record) => record.id === filteredRecord.id);
      isNullOrEmpty(recordFound) ?
        recordsInstance.push(filteredRecord) :
        recordsInstance.push(recordFound);
    });
    recordsInstance.forEach((record) => {
      this.filteredRecords = addOrUpdateArrayRecord(
        this.filteredRecords, record, false,
        (item) => item.id === record.id
      );
    });
  }

  /**
   * Page the records by page query
   * @param query Query on how the records will be filtered
   */
  private _filterRecordsByPageQuery(query: McsQueryParam): Observable<T[]> {
    let recordsCountToPull = query.pageSize * query.pageIndex;
    let currentRecordCount = this.dataRecords.length;
    let requestRecordFromCache = this._allRecordsAreLoaded
      || (currentRecordCount >= recordsCountToPull);

    let filterByObserver = requestRecordFromCache ?
      this._pageRecordsFromCache(query) :
      this._pageRecordsFromContext(query);
    return filterByObserver;
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
        this._allRecordsCount = this._context.totalRecordsCount;
        this._cacheRecords(...newRecords);
      })
    );
  }

  /**
   * Get record by ID from context data
   * @param id Id of the record to obtain
   */
  private _getRecordByIdFromContext(id: string): Observable<T> {
    this._detailedItems.delete(id);
    return this._context.getRecordById(id).pipe(
      tap((item) => {
        this._cacheRecords(item);
        this._detailedItems.add(item.id);
        this._notifyDataChange();
      })
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
  private _cacheRecords(...newItems: T[]): void {
    let updatedItems = newItems && newItems.filter((item) => !this._detailedItems.has(item.id));
    this.dataRecords = mergeArrays(
      this.dataRecords, updatedItems,
      (firstRecord: T, secondRecord: T) => firstRecord.id === secondRecord.id
    );
  }
}
