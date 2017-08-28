import { Observable } from 'rxjs/Rx';

export interface McsDataSource<T> {
  /**
   * This will invoke when the obtainment of data in the connect method is completed
   */
  onCompletion(): void;

  /**
   * Connect the data to get the datasource
   */
  connect(): Observable<T[]>;

  /**
   * Disconnect all the subscribers or destroy all memory allocation here
   */
  disconnect(): void;
}
