import {
  Observable,
  Scheduler
} from 'rxjs';
import {
  catchError,
  switchMap
} from 'rxjs/operators';
import { isNullOrEmpty } from '../../utilities';

export abstract class McsListSourceBase<T> {

  private _recordsMap = new Map<any, T[]>();
  private _cachedRecords = new Array<T>();

  /**
   * Find all the records from the api provided or the repository
   * and group the results based on keyFn provided
   *
   * `@Note:` This will notify the subscriber when one of the streams triggered
   * @param keyFn Key function served as map
   */
  public findAllRecordsMapStream(keyFn: (item: T) => any): Observable<Map<any, T[]>> {
    return this.findAllRecordsStream().pipe(
      catchError((error) => Observable.throw(error)),
      switchMap((records) => {
        if (isNullOrEmpty(records)) { return Observable.of(undefined); }

        let recordsHaveChanged = this._cachedRecords.length !== records.length;
        if (recordsHaveChanged) { this._setMapRecords(records, keyFn); }
        return Observable.of(this._recordsMap, Scheduler.async);
      })
    );
  }

  /**
   * Find all records from stream
   *
   * `@Note:` This will notify the subscriber when one of the streams triggered
   */
  public findAllRecordsStream(): Observable<T[]> {
    return this.getStreams().pipe(
      catchError((error) => Observable.throw(error)),
      switchMap(() => this.getAllRecords().map((records) => records))
    );
  }

  /**
   * Clears the cache records
   */
  public clearRecords(): void {
    this._recordsMap.clear();
  }

  /**
   * Gets all records from inherited class
   */
  protected abstract getAllRecords(): Observable<T[]>;

  /**
   * Gets all implemented streams from inherited class
   */
  protected abstract getStreams(): Observable<any>;

  /**
   * Sets the map records based on the result provided
   * @param records Records to be mapped
   * @param keyFn Key function to be served as key in the map
   */
  private _setMapRecords(records: T[], keyFn: (item: T) => any): void {
    if (isNullOrEmpty(records)) { return; }

    this._cachedRecords = new Array(...records);
    this.clearRecords();
    records.forEach((record) => {
      let key = keyFn(record);

      let listContent = this._recordsMap.get(key);
      if (isNullOrEmpty(listContent)) { listContent = new Array(); }

      listContent.push(record);
      this._recordsMap.set(key, listContent);
    });
  }
}
