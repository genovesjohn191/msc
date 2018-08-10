import {
  Observable,
  Subject,
  of,
  isObservable
} from 'rxjs';
import {
  startWith,
  switchMap,
  map
} from 'rxjs/operators';
import {
  McsDataSource,
  McsDataStatus
} from '../../core';
import {
  isNullOrEmpty,
  unsubscribeSubject
} from '../../utilities';

export class TableDataSource<T> implements McsDataSource<T> {
  /**
   * This will notify the subscribers of the datasource that the obtainment is InProgress
   */
  public dataLoadingStream: Subject<McsDataStatus>;

  private _cacheDataRecords: T[];
  private _fakeDataRecords: Set<T>;
  private _fakeDataRecordsChange = new Subject<void>();
  private _dataRecords: Observable<T[]>;

  constructor(_providedRecords: T[] | Observable<T[]>) {
    this._fakeDataRecords = new Set();
    this.dataLoadingStream = new Subject<McsDataStatus>();
    this._dataRecords = isObservable(_providedRecords) ?
      _providedRecords : of(_providedRecords);
  }

  /**
   * Connect function called by the table to retrieve
   * one stream containing the data to render.
   */
  public connect(): Observable<T[]> {
    if (!isNullOrEmpty(this._cacheDataRecords)) { this._dataRecords = of(this._cacheDataRecords); }
    return this._fakeDataRecordsChange
      .pipe(
        startWith(null),
        switchMap((requestorInstance) => {
          // We want the table to be load only when the record is coming from API
          if (isNullOrEmpty(requestorInstance)) {
            this.dataLoadingStream.next(McsDataStatus.InProgress);
          }
          return this._dataRecords.pipe(
            map((response) => response.concat(Array.from(this._fakeDataRecords)))
          );
        }),
        map((records) => {
          this._cacheDataRecords = records;
          return this._cacheDataRecords;
        })
      );
  }

  /**
   * Destroy all objects from the current connection
   * and return all the record to its original value
   */
  public disconnect() {
    this._fakeDataRecords.clear();
    unsubscribeSubject(this._fakeDataRecordsChange);
  }

  /**
   * This will invoke when the data obtainment is completed
   * @param servers Data to be provided when the datasource is connected
   */
  public onCompletion(_status: McsDataStatus, _record: T[]): void {
    this.dataLoadingStream.next(_status);
  }

  /**
   * Add record to an existing datasource
   * @param _record record to be added
   */
  public addRecord(_record: T): void {
    if (isNullOrEmpty(_record)) { return; }
    this._fakeDataRecords.add(_record);
    this._fakeDataRecordsChange.next();
  }

  /**
   * Deletes record to an existing datasource
   * @param _record record to be deleted
   */
  public deleteRecord(_record: T): void {
    if (isNullOrEmpty(_record)) { return; }
    this._fakeDataRecords.delete(_record);
    this._fakeDataRecordsChange.next();
  }
}
