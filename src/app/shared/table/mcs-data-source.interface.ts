import {
  Observable,
  Subject
} from 'rxjs';
import { DataStatus } from '@app/models';

export interface McsDataSource<T> {
  /**
   * Invoke this method when data is undergo process on the datasource itself
   * to notify the subscribers if the data is on-going.
   */
  dataLoadingStream: Subject<DataStatus>;

  /**
   * This will invoke when the obtainment of data in the connect method is completed,
   * and provide the actual record obtained from the connection if success
   */
  onCompletion(status: DataStatus, data?: T[]): void;

  /**
   * Connect the data to get the datasource
   */
  connect(): Observable<T[]>;

  /**
   * Disconnect all the subscribers or destroy all memory allocation here
   */
  disconnect(): void;
}
