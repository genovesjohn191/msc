import {
  Subject,
  Observable,
  Subscription,
  of
} from 'rxjs';
import {
  map,
  finalize
} from 'rxjs/operators';
import {
  isNullOrEmpty,
  addOrUpdateArrayRecord,
  deleteArrayRecord,
  clearArrayRecord,
  compareStrings,
  mergeArrays,
  unsubscribeSafely
} from '@app/utilities';
import {
  Search,
  Paginator
} from '@app/shared';
import {
  McsEntityBase,
  McsApiSuccessResponse,
} from '@app/models';

const DEFAULT_PAGE_INDEX = 1;
const DEFAULT_PAGE_SIZE = 1000;

export abstract class McsRepositoryBase<T extends McsEntityBase> {
  /**
   * Updated records obtained from each individual call to API (getRecordById)
   */
  private _updatedRecordsById: T[] = new Array();
  private _previouslySearched: string;

  /**
   * Get or Set the total records count of the entity
   */
  public get totalRecordsCount(): number { return this._totalRecordsCount; }
  private _totalRecordsCount: number = 0;

  /**
   * Get the Data records from the API
   */
  public get dataRecords(): T[] { return this._dataRecords; }
  private _dataRecords: T[] = new Array();

  /**
   * Return the currently filtered records base on filtering method
   *
   * `@Note:` These hold the record that was filtered when FindAllRecords method was called
   */
  public get filteredRecords(): T[] { return this._filteredRecords; }
  private _filteredRecords: T[] = new Array();

  /**
   * Event that emits when record changes
   */
  public get dataRecordsChanged(): Subject<T[]> { return this._dataRecordsChanged; }
  private _dataRecordsChanged: Subject<T[]> = new Subject<T[]>();

  /**
   * Event that emits after data obtained from API
   */
  public get afterDataObtainedFromApi(): Subject<void> { return this._afterDataObtainedFromApi; }
  private _afterDataObtainedFromApi: Subject<void> = new Subject<void>();

  /**
   * Returns true when data records has content, otherwise false
   */
  public get hasDataRecords(): boolean {
    return !isNullOrEmpty(this.dataRecords);
  }

  /**
   * Data records obtainment subscription
   */
  private _getDataRecordsSubscription: Subscription;

  /**
   * Dispose all the resources of the management based such as
   * Stream, Array records, etc...
   */
  public disposeManagerBase(): void {
    if (!isNullOrEmpty(this._dataRecords)) {
      this._dataRecords.splice(0);
      this._dataRecords = undefined;
    }
    unsubscribeSafely(this._getDataRecordsSubscription);
  }

  /**
   * Update data record based on ID
   *
   * `@Note`: Make sure the data records has id property
   * @param record Record to be updated
   */
  public updateRecord(record: T): void {
    if (isNullOrEmpty(record)) { return; }

    // Update the record
    addOrUpdateArrayRecord(this._dataRecords, record, false,
      (_existingRecord: T) => _existingRecord.id === record.id);
    this._notifyDataRecordsChanged();
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
   * Delete record based on record content
   *
   * `@Note`: Make sure the data records has id property
   * @param record Record to be deleted it can be the whole record or Id
   */
  public deleteRecordById(recordId: string): void {
    if (isNullOrEmpty(recordId)) { return; }
    deleteArrayRecord(this._dataRecords, (_record: T) => {
      return recordId === _record.id;
    });
    this._notifyDataRecordsChanged();
  }

  /**
   * Add record to the data record list
   * @param record Record to be added
   */
  public addRecord(record: T): void {
    if (isNullOrEmpty(record)) { return; }
    addOrUpdateArrayRecord(this._dataRecords, record, false);
    this._notifyDataRecordsChanged();
  }

  /**
   * Merge the provided records with the original records and updated the total record count
   * @param records Records to be merged
   */
  public mergeRecords(records: T[]): void {
    let noRecords = isNullOrEmpty(records) || isNullOrEmpty(this._dataRecords);
    if (noRecords) { return; }
    let mergedArrays = mergeArrays(this.dataRecords, records,
      (_first: T, _second: T) => {
        return _first.id === _second.id;
      });
    this._totalRecordsCount += mergedArrays.length - this._dataRecords.length;
    this._dataRecords = mergedArrays;
    this._notifyDataRecordsChanged();
  }

  /**
   * Clears out the data records of the repository
   */
  public clearRecords(): void {
    this._clearCacheData();
    this._totalRecordsCount = 0;
    this._notifyDataRecordsChanged();
  }

  /**
   * Refresh the data records
   */
  public refreshRecords(): void {
    this.clearRecords();
  }

  /**
   * Sort Records based on predicate definition
   * @param predicate Predicate definition to be the method of sorting
   */
  public sortRecords(predicate: (first: T, second: T) => number) {
    this._dataRecords.sort(predicate);
    this._notifyDataRecordsChanged();
  }

  /**
   * This will find all the records based on the paging and searching method
   * if the content is not found, the API will trigger
   * @param page Page settings where the data returned are based on page index and size
   * @param search Search settings where the keyword is use to filter the data
   * @param fromCache Flag to determine where the data should get from
   */
  public findAllRecords(
    page?: Paginator,
    search?: Search,
    fromCache: boolean = true
  ): Observable<T[]> {
    // We need to clear the records when searching to be able to get the data from api again
    let isSearching = !isNullOrEmpty(search) && search.searching
      || !isNullOrEmpty(search) && compareStrings(this._previouslySearched, search.keyword) !== 0;
    if (isSearching) {
      this._resetPaging(page);
      this._clearCacheData();
    }

    let pageIndex: number = DEFAULT_PAGE_INDEX;
    let pageSize: number = DEFAULT_PAGE_SIZE;
    let searchKeyword: string = '';
    if (!isNullOrEmpty(page)) {
      pageIndex = page.pageIndex + 1;
      pageSize = page.pageSize;
    }
    if (!isNullOrEmpty(search)) {
      searchKeyword = search.keyword;
      this._previouslySearched = searchKeyword;
    }

    // Set flags where to obtain the data
    let displayedRecords = Math.min(pageSize * (pageIndex), this._totalRecordsCount);
    let dataRecordsLength = this.hasDataRecords ? this.dataRecords.length : 0;
    let requestRecordsFromApi = displayedRecords === 0
      || displayedRecords > dataRecordsLength
      || !this.hasDataRecords;
    let requestRecordFromCache = !requestRecordsFromApi && fromCache;

    return requestRecordFromCache ?
      this._findAllRecordsFromCache(displayedRecords) :
      this._findAllRecordsFromApi(pageIndex, pageSize, searchKeyword);
  }

  /**
   * Find any record using id for its comparison method.
   * And return the record as observable<T>
   * @param id Id to be based as comparison
   * @param fromCache Flag to determine where the data should get from
   */
  public findRecordById(id: string, fromCache: boolean = true): Observable<T> {
    // Return the record immediately when found in cache
    let recordFoundFromCache = this._updatedRecordsById.find((record: T) => {
      return record.id === id;
    });
    let requestRecordFromCache = !isNullOrEmpty(recordFoundFromCache) && fromCache;
    if (requestRecordFromCache) {
      return of(recordFoundFromCache);
    }

    // Call the API if record has not been called once
    return this.getRecordById(id)
      .pipe(
        map((record) => {
          let noRecordFound = isNullOrEmpty(record) || isNullOrEmpty(record.content);
          if (noRecordFound) { return undefined; }

          this.updateRecord(record.content);
          let updatedRecord = this.dataRecords.find((recordInstance) =>
            recordInstance.id === record.content.id
          );
          if (!isNullOrEmpty(updatedRecord)) {
            this._updatedRecordsById.push(updatedRecord);
          }
          return updatedRecord;
        }),
        finalize(() => this._afterDataObtainedFromApi.next())
      );
  }

  /**
   * Get all records based on type
   */
  protected abstract getAllRecords(
    pageIndex: number,
    pageSize: number,
    keyword: string
  ): Observable<McsApiSuccessResponse<T[]>>;

  /**
   * Get the corresponding record by ID
   * @param recordId Record id to find
   */
  protected abstract getRecordById(recordId: string): Observable<McsApiSuccessResponse<T>>;

  /**
   * Find all records from datarecords cache based on the record count
   * @param recordsCount Records count to pull in the cache
   */
  private _findAllRecordsFromCache(recordsCount: number): Observable<T[]> {
    let pageData = this._dataRecords.slice();
    let actualData = pageData.splice(0, recordsCount);
    return of(actualData)
      .pipe(
        map((data) => {
          this._filteredRecords = data;
          return data;
        })
      );
  }

  /**
   * Find all records from API and automatically update the cache data
   * @param pageIndex Page Index where the page should be started
   * @param pageSize Page size to pull data from the current page
   * @param keyword Keyword to searched
   */
  private _findAllRecordsFromApi(
    pageIndex: number,
    pageSize: number,
    keyword: string): Observable<T[]> {
    // Get all records from API calls implemented under inherited class
    return this.getAllRecords(pageIndex, pageSize, keyword)
      .pipe(
        map((data) => {
          if (isNullOrEmpty(data)) { return new Array(); }
          this._totalRecordsCount = data.totalCount;

          // Filter the unobtained records based on the updated records
          let unobtainedRecords: T[];
          unobtainedRecords = data.content && data.content.filter((record: T) => {
            let dataExist = this._updatedRecordsById.find((updated: T) => updated.id === record.id);
            return isNullOrEmpty(dataExist);
          });

          // We need to merge only the un-obtained records in order to retain the
          // instance of the obtained records from the updated records
          this._dataRecords = mergeArrays(this._dataRecords, unobtainedRecords,
            (_first: T, _second: T) => {
              let dataExist = isNullOrEmpty(_first.id) ? false : _first.id === _second.id;
              return dataExist;
            });
          this._filteredRecords = this._dataRecords;
          return this._dataRecords;
        }),
        finalize(() => this._afterDataObtainedFromApi.next())
      );
  }

  /**
   * Clears the cache data and it will not notify the dataChange event
   */
  private _clearCacheData(): void {
    clearArrayRecord(this._dataRecords);
    clearArrayRecord(this._updatedRecordsById);
  }

  /**
   * Notify the data records changed event
   */
  private _notifyDataRecordsChanged(): void {
    this._dataRecordsChanged.next(this._dataRecords);
  }

  /**
   * Reset repository paging
   * @param paginator
   */
  private _resetPaging(paginator: Paginator): void {
    if (isNullOrEmpty(paginator)) { return; }
    paginator.pageIndex = 0;
  }
}
