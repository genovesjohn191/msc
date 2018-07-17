import {
  Observable,
  Subject,
  of
} from 'rxjs';
import {
  McsDataSource,
  McsDataStatus
} from '../../core';

export class TableArrayDataSource<T> implements McsDataSource<T> {
  /**
   * This will notify the subscribers of the datasource that the obtainment is InProgress
   */
  public dataLoadingStream: Subject<McsDataStatus>;

  constructor(private _dataRecords: T[]) {
    this.dataLoadingStream = new Subject<McsDataStatus>();
  }

  /**
   * Connect function called by the table to retrieve
   * one stream containing the data to render.
   */
  public connect(): Observable<T[]> {
    return of(this._dataRecords);
  }

  /**
   * Destroy all objects from the current connection
   * and return all the record to its original value
   */
  public disconnect() {
    // Release all resources
  }

  /**
   * This will invoke when the data obtainment is completed
   * @param servers Data to be provided when the datasource is connected
   */
  public onCompletion(_status: McsDataStatus, _record: T[]): void {
    // Execute all data from completion
  }
}
