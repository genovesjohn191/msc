import {
  Observable,
  asyncScheduler,
  of,
  throwError
} from 'rxjs';
import {
  catchError,
  switchMap,
  map
} from 'rxjs/operators';
import { isNullOrEmpty } from '../../utilities';

export abstract class McsListSourceBase<T> {
  /**
   * Find all the records from the api provided or the repository
   * and group the results based on keyFn provided
   *
   * `@Note:` This will notify the subscriber when one of the streams triggered
   * @param keyFn Key function served as map
   */
  public findAllRecordsMapStream(keyFn: (item: T) => any): Observable<Map<any, T[]>> {
    return this.findAllRecordsStream().pipe(
      catchError((error) => throwError(error)),
      switchMap((records) => {
        let recordsMap = this._convertToMapRecords(records, keyFn);
        return of(recordsMap, asyncScheduler);
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
      catchError((error) => throwError(error)),
      switchMap(() =>
        this.getAllRecords().pipe(
          map((records) => records.filter(this.filterMethod.bind(this)))
        )
      )
    );
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
   * Filter predicate method to which will be obtained
   * @param _record Record to be checked
   */
  protected abstract filterMethod(_record: T): boolean;

  /**
   * Convert the array object into map records
   * @param records Records to be mapped
   * @param keyFn Key function to be served as key in the map
   */
  private _convertToMapRecords(records: T[], keyFn: (item: T) => any): Map<any, T[]> {
    if (isNullOrEmpty(records)) { return undefined; }
    let _recordsMap = new Map<any, T[]>();

    records.forEach((record) => {
      let key = keyFn(record);

      let listContent = _recordsMap.get(key);
      if (isNullOrEmpty(listContent)) { listContent = new Array(); }

      listContent.push(record);
      _recordsMap.set(key, listContent);
    });
    return _recordsMap;
  }
}
