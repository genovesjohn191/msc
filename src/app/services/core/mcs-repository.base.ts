import {
  of,
  Observable,
  Subject
} from 'rxjs';
import {
  filter,
  finalize,
  switchMap,
  tap
} from 'rxjs/operators';

import { EventBusDispatcherService } from '@app/event-bus';
import { McsEvent } from '@app/events';
import {
  McsEntityBase,
  McsQueryParam
} from '@app/models';
import {
  addOrUpdateArrayRecord,
  clearArrayRecord,
  compareJsons,
  deleteArrayRecord,
  isNullOrEmpty,
  mergeArrays
} from '@app/utilities';

import { McsDataContext } from './mcs-data-context.interface';
import { McsRepositoryConfig } from './mcs-repository.config';
import { McsRepository } from './mcs-repository.interface';

export abstract class McsRepositoryBase<T extends McsEntityBase> implements McsRepository<T> {
  protected dataRecords = new Array<T>();
  protected filteredRecords = new Array<T>();

  // Other variables
  private _allRecordsCount: number = 0;
  private _previousQuery: McsQueryParam = new McsQueryParam();
  private _detailedItems: Set<string> = new Set();

  // Events notifier for live data refresh on the view per subscription
  private _dataCleared = new Subject<void>();

  constructor(
    private _context: McsDataContext<T>,
    private _eventDispatcher: EventBusDispatcherService,
    private _repositoryConfig?: McsRepositoryConfig<T>
  ) { }

  /**
   * Get all records from the repository and creates a new observable
   * if the records has been changed the observers will be notified
   */
  public getAll(parentId?: string): Observable<T[]> {
    let allRecordsObserver = this._allRecordsAreLoaded ?
      this._getAllRecordsFromCache() :
      this._getAllRecordsFromContext(parentId);

    return allRecordsObserver.pipe(
      switchMap(() => of(this.dataRecords)),
      finalize(() => {
        this._notifyDataChangeEvent();
        this._notifyDataAllUpdateEvent();
      })
    );
  }

  /**
   * Filter the records from the repository based on the predicate provided
   * and creates a new observable if the records has been changed the
   * observers will be notified
   * @param query Query of the records to be filtered
   */
  public filterBy(query: McsQueryParam, parentId?: string): Observable<T[]> {
    let filteredRecords: Observable<T[]>;

    // Always set the paging to be the same so it wont be recognized by the comparison
    this._previousQuery.pageIndex = query.pageIndex;
    this._previousQuery.pageSize = query.pageSize;

    // Filter records by search keyword query and return the record immediately.
    // The searching would always look on the context and not on the cache
    let queryIsDifferent = compareJsons(query, this._previousQuery) !== 0;
    if (queryIsDifferent) { this.filteredRecords = new Array(); }
    this._previousQuery = Object.assign({}, query);


    let isSearching = !isNullOrEmpty(query.keyword) || queryIsDifferent;
    filteredRecords = isSearching ?
      this._filterRecordsBySearchQuery(query) :
      this._filterRecordsByPageQuery(query, parentId);

    return filteredRecords.pipe(
      switchMap(() => of(this.filteredRecords)),
      finalize(() => {
        this._notifyDataChangeEvent();
        this._notifyDataAllUpdateEvent();
      })
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
      finalize(() => this._notifyDataChangeEvent())
    );
  }

  /**
   * Get the record from the current datasource based on the predicate provided
   * @param predicate Predicate of the item that returns true if the record should be obtained
   */
  public getBy(predicate: (entity: T) => boolean): Observable<T> {
    let foundItem = this.dataRecords.find((item) => predicate(item));
    return of(foundItem).pipe(
      finalize(() => this._notifyDataChangeEvent())
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
      this._notifyDataChangeEvent();
      if (!isNullOrEmpty(this._allRecordsCount)) { ++this._allRecordsCount; }
    } else {
      this._notifyDataChangeEvent();
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
    this._notifyDataChangeEvent();
  }

  /**
   * Gets the repository configuration
   */
  public getConfig(): McsRepositoryConfig<T> {
    return this._repositoryConfig;
  }

  /**
   * An observable event that emits when the data has been cleared
   * @deprecated The repository is already notifying the changes to
   * clearing the data events using EventBus.
   * This will be removed once the TableDatasource2 was already implemented in all listing.
   */
  public dataClear(): Observable<void> {
    return this._dataCleared.asObservable();
  }

  /**
   * Sort Records based on predicate definition
   * @param predicate Predicate definition to be the method of sorting
   */
  public sortRecords(predicate: (first: T, second: T) => number): void {
    this.dataRecords.sort(predicate);
    this._notifyDataChangeEvent();
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
    if (this.getTotalRecordsCount() <= 0) { return; }

    this._context.totalRecordsCount = 0;
    this._allRecordsCount = 0;
    clearArrayRecord(this.dataRecords);
    clearArrayRecord(this.filteredRecords);
    this._dataCleared.next();
    this._notifyDataClearEvent();
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
  private _pageRecordsFromContext(query: McsQueryParam, parentId: string): Observable<T[]> {
    return this._context.filterRecords(query, parentId).pipe(
      tap((newFilteredRecords) => {
        this._allRecordsCount = this._context.totalRecordsCount;
        this._updateFilteredRecords(newFilteredRecords);
        this._cacheRecords(...newFilteredRecords);
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
  private _filterRecordsBySearchQuery(query: McsQueryParam, parentId?: string): Observable<T[]> {
    let searchedRecords = this._context.filterRecords(query, parentId).pipe(
      tap((newFilteredRecords) => {
        this._allRecordsCount = this._context.totalRecordsCount;
        this._updateFilteredRecords(newFilteredRecords);
        this._cacheRecords(...newFilteredRecords);
      })
    );
    return searchedRecords;
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
  private _filterRecordsByPageQuery(query: McsQueryParam, parentId: string): Observable<T[]> {
    let recordsCountToPull = query.pageSize * query.pageIndex;
    let currentRecordCount = this.dataRecords.length;
    let requestRecordFromCache = this._allRecordsAreLoaded
      || (currentRecordCount >= recordsCountToPull);

    let filterByObserver = requestRecordFromCache ?
      this._pageRecordsFromCache(query) :
      this._pageRecordsFromContext(query, parentId);

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
  private _getAllRecordsFromContext(parentId: string): Observable<T[]> {
    return this._context.getAllRecords(parentId).pipe(
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
        this._notifyDataChangeEvent();
      })
    );
  }

  private _notifyDataChangeEvent(): void {
    if (isNullOrEmpty(this._repositoryConfig.dataChangeEvent)) { return; }
    this._eventDispatcher.dispatch(
      this._repositoryConfig.dataChangeEvent,
      this.dataRecords
    );
  }

  private _notifyDataClearEvent(): void {
    if (isNullOrEmpty(this._repositoryConfig.dataClearEvent)) { return; }
    this._eventDispatcher.dispatch(
      this._repositoryConfig.dataClearEvent,
      null
    );
  }

  private _notifyDataAllUpdateEvent(): void {
    this._eventDispatcher.dispatch(McsEvent.dataAllRecordsUpdated);
  }

  private _cacheRecords(...newItems: T[]): void {
    // Merge the new records to the cached datasource, if the record
    // is already exist, the instance will be remained
    let updatedItems = newItems && newItems.filter((item) => !this._detailedItems.has(item.id));
    this.dataRecords = mergeArrays(
      this.dataRecords, updatedItems,
      (firstRecord: T, secondRecord: T) => firstRecord.id === secondRecord.id
    );
  }
}
