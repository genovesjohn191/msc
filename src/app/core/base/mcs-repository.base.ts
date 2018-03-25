import {
  Subject,
  Observable,
  Subscription
} from 'rxjs/Rx';
import { McsPaginator } from '../interfaces/mcs-paginator.interface';
import { McsSearch } from '../interfaces/mcs-search.interface';
import { McsApiSuccessResponse } from '../models/response/mcs-api-success-response';
import {
  isNullOrEmpty,
  addOrUpdateArrayRecord,
  deleteArrayRecord,
  clearArrayRecord,
  compareStrings,
  mergeArrays,
  unsubscribeSafely
} from '../../utilities';

const DEFAULT_PAGE_INDEX = 1;
const DEFAULT_PAGE_SIZE = 1000;

export abstract class McsRepositoryBase<T> {
  /**
   * Updated records obtained from each individual call to API (getRecordById)
   */
  private _updatedRecordsById: T[] = new Array();
  private _previouslySearched: string;

  /**
   * Get or Set the total records count of the entity
   */
  public get totalRecordsCount(): number { return this._totalRecordsCount; }
  public set totalRecordsCount(value: number) { this._totalRecordsCount = value; }
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
   * Stream that emits when record changes
   */
  public get dataRecordsChanged(): Subject<T[]> { return this._dataRecordsChanged; }
  private _dataRecordsChanged: Subject<T[]> = new Subject<T[]>();

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
  private _isInitialized: boolean = false;

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
    addOrUpdateArrayRecord(this._dataRecords, record, true,
      (_existingRecord: any) => _existingRecord.id === (record as any).id);
    this._notifyDataRecordsChanged();
  }

  /**
   * Delete record based on record content
   *
   * `@Note`: Make sure the data records has id property
   * @param record Record to be deleted it can be the whole record or Id
   */
  public deleteRecordById(recordId: string): void {
    if (isNullOrEmpty(recordId)) { return; }
    deleteArrayRecord(this._dataRecords, (_record: any) => {
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
      (_first: any, _second: any) => {
        return _first.id === _second.id;
      });
    this.totalRecordsCount += mergedArrays.length - this._dataRecords.length;
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
    page?: McsPaginator,
    search?: McsSearch,
    fromCache: boolean = true
  ): Observable<T[]> {
    // We need to clear the records when searching to be able to get the data from api again
    let isSearching = !isNullOrEmpty(search) && search.searching
      || !isNullOrEmpty(search) && compareStrings(this._previouslySearched, search.keyword) !== 0;
    if (isSearching) {
      page.pageIndex = 0;
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
    let requestRecordsFromApi = displayedRecords > dataRecordsLength || !this.hasDataRecords;
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
    let recordFoundFromCache = this._updatedRecordsById.find((record: any) => {
      return record.id === id;
    });
    let requestRecordFromCache = !isNullOrEmpty(recordFoundFromCache) && fromCache;
    if (requestRecordFromCache) {
      return Observable.of(recordFoundFromCache);
    }

    // Call the API if record has not been called once
    return this.getRecordById(id)
      .finally(() => this._notifyAfterDataObtained())
      .map((record) => {
        // Update record content
        this._updatedRecordsById.push(record.content);
        isNullOrEmpty(this.dataRecords)
          ? this.addRecord(record.content)
          : this.updateRecord(record.content);
        return record.content;
      });
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
   * Event that emits after the data obtained in getting all records or getting individual records
   */
  protected abstract afterDataObtained(): void;

  /**
   * Patch the data records based on the updated records
   * during individual obtainment (getRecordById)
   */
  private _patchRecordsByUpdatedRecords(): void {
    if (isNullOrEmpty(this._updatedRecordsById)) { return; }
    this._updatedRecordsById.forEach((record: any) => {
      addOrUpdateArrayRecord(this._dataRecords, record, true,
        (_existingRecord: any) => _existingRecord.id === (record as any).id);
    });
  }

  /**
   * Find all records from datarecords cache based on the record count
   * @param recordsCount Records count to pull in the cache
   */
  private _findAllRecordsFromCache(recordsCount: number): Observable<T[]> {
    let pageData = this._dataRecords.slice();
    let actualData = pageData.splice(0, recordsCount);
    return Observable.of(actualData)
      .map((data) => {
        this._filteredRecords = data;
        return data;
      });
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
      .finally(() => this._notifyAfterDataObtained())
      .map((data) => {
        if (isNullOrEmpty(data)) { return new Array(); }
        this._totalRecordsCount = data.totalCount;
        this._dataRecords = mergeArrays(this._dataRecords,
          data.content, (_first: any, _second: any) => {
            return _first.id === _second.id;
          });
        this._filteredRecords = this._dataRecords;
        this._patchRecordsByUpdatedRecords();
        return this._dataRecords;
      });
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
   * Notify after data obtained abstract method
   */
  private _notifyAfterDataObtained(): void {
    if (!this._isInitialized) {
      this.afterDataObtained();
      this._isInitialized = true;
    }
  }
}
