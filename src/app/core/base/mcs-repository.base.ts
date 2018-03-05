import {
  Subject,
  Observable,
  Subscription
} from 'rxjs/Rx';
import { McsPaginator } from '../interfaces/mcs-paginator.interface';
import { McsSearch } from '../interfaces/mcs-search.interface';
import { McsDataStatus } from '../enumerations/mcs-data-status.enum';
import { McsApiSuccessResponse } from '../models/response/mcs-api-success-response';
import {
  isNullOrEmpty,
  addOrUpdateArrayRecord,
  deleteArrayRecord,
  clearArrayRecord,
  mergeArrays,
  unsubscribeSafely
} from '../../utilities';

const MAX_DISPLAY_RECORD = 200;

export abstract class McsRepositoryBase<T> {
  /**
   * ID list of the updated element that was searched when getRecorById called
   */
  private _obtainedByIdList: Set<string> = new Set<string>();
  private _dataRecordsObtained: boolean = false;

  /**
   * Get or Set the total records count of the entity
   */
  public get totalRecordsCount(): number { return this._totalRecordsCount; }
  public set totalRecordsCount(value: number) { this._totalRecordsCount = value; }
  private _totalRecordsCount: number = 0;

  /**
   * Get or Set the data status of the data record obtainment
   */
  public get dataStatus(): McsDataStatus { return this._dataStatus; }
  public set dataStatus(value: McsDataStatus) { this._dataStatus = value; }
  private _dataStatus: McsDataStatus = McsDataStatus.Success;

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
    // Find the corresponding record
    let existingRecord = this._dataRecords.find((_item) => {
      return (_item as any).id === (record as any).id;
    });

    // TODO: Add common method for this to be used also in the constructor of models
    if (!isNullOrEmpty(existingRecord)) {
      // Update only the fields of updated record from API response
      for (let property in record) {
        if (existingRecord.hasOwnProperty(property)) {
          existingRecord[property] = record[property];
        }
      }
    }
    let updatedRecord = isNullOrEmpty(existingRecord) ? record : existingRecord;

    // Update the record
    addOrUpdateArrayRecord(this._dataRecords,
      updatedRecord, true,
      (_first: any, _second: any) => {
        return _first.id === _second.id;
      });
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
    clearArrayRecord(this._dataRecords);
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
   * @param whereClause Where clause delegate for filtering condition
   */
  public findAllRecords(page?: McsPaginator, search?: McsSearch): Observable<T[]> {
    // We need to clear the records when the flag for caching is set to false
    let isSearching = !isNullOrEmpty(search) && search.searching;
    this._dataStatus = McsDataStatus.InProgress;
    this._dataRecordsObtained = true;

    // We need to reset the page in order to get the data from initial page
    if (isSearching && !isNullOrEmpty(page)) {
      page.pageIndex = 0;
    }

    let displayedRecords = isNullOrEmpty(page) ? MAX_DISPLAY_RECORD :
      page.pageSize * (page.pageIndex + 1);
    let dataRecordsLength = isNullOrEmpty(this.dataRecords) ? 0 : this.dataRecords.length;
    let requestRecords = !!(displayedRecords > dataRecordsLength)
      && !!(this._totalRecordsCount !== dataRecordsLength)
      || this._totalRecordsCount === 0 || isSearching;

    if (requestRecords) {
      // Get all records from API calls implemented under inherited class
      return this.getAllRecords(displayedRecords, !isNullOrEmpty(search) ? search.keyword : '')
        .catch((error) => {
          this._dataStatus = McsDataStatus.Error;
          return Observable.throw(error);
        })
        .map((data) => {
          if (!isNullOrEmpty(data)) {
            this._totalRecordsCount = data.totalCount;
            this._dataRecords = data.content;
            this._filteredRecords = data.content;
            this._dataStatus = McsDataStatus.Success;
            this._obtainedByIdList.clear();
          } else {
            this._dataStatus = McsDataStatus.Empty;
          }
          return isNullOrEmpty(data) ? new Array() : data.content;
        });
    } else {
      // We need to mock the data to pageData
      // so that we wont touch the original record
      let pageData = this._dataRecords.slice();
      let actualData = pageData.splice(0, displayedRecords);
      return Observable.of(actualData)
        .catch((error) => {
          this._dataStatus = McsDataStatus.Error;
          return Observable.throw(error);
        })
        .map((data) => {
          this._filteredRecords = data;
          this._dataStatus = !isNullOrEmpty(data) ?
            McsDataStatus.Success : McsDataStatus.Empty;
          return data;
        });
    }
  }

  /**
   * Find any record using id for its comparison method.
   * And return the record as observable<T>
   * @param id Id to be based as comparison
   */
  public findRecordById(id: string): Observable<T> {
    // Find record to data records
    let recordFound = this.dataRecords.find((data) => {
      return (data as any).id === id;
    });

    // Call the API if the record has not yet found and not yet updated
    let recordIsOutdated = isNullOrEmpty(recordFound) || !this._obtainedByIdList.has(id);

    if (recordIsOutdated) {
      return this.getRecordById(id)
        .map((record) => {
          // Update record content
          this.updateRecord(record.content);
          this._obtainedByIdList.add((id));

          // We need to save manually the data when findAllRecords was not yet invoke
          if (!this._dataRecordsObtained) {
            this.dataRecords.push(record.content);
          }
          return record.content;
        });
    }
    return recordFound ? Observable.of(recordFound) : Observable.empty();
  }

  /**
   * Get all records based on type
   */
  protected abstract getAllRecords(
    recordCount: number,
    keyword: string
  ): Observable<McsApiSuccessResponse<T[]>>;

  /**
   * Get the corresponding record by ID
   * @param recordId Record id to find
   */
  protected abstract getRecordById(recordId: string): Observable<McsApiSuccessResponse<T>>;

  /**
   * Notify the data records changed event
   */
  private _notifyDataRecordsChanged(): void {
    this._dataRecordsChanged.next(this._dataRecords);
  }
}
