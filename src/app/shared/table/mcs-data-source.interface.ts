import {
  Observable,
  Subject
} from 'rxjs';
import { McsDataStatus } from '@app/models';

export interface McsDataSource<T> {
  /**
   * Invoke this method when data is undergo process on the datasource itself
   * to notify the subscribers if the data is on-going.
   */
  dataLoadingStream: Subject<McsDataStatus>;

  /**
   * This will invoke when the obtainment of data in the connect method is completed,
   * and provide the actual record obtained from the connection if success
   */
  onCompletion(status: McsDataStatus, data?: T[]): void;

  /**
   * Connect the data to get the datasource
   */
  connect(): Observable<T[]>;

  /**
   * Disconnect all the subscribers or destroy all memory allocation here
   */
  disconnect(): void;
}
