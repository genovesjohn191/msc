import { Observable } from 'rxjs/Rx';

export interface McsDataSource<T> {
  /**
   * This will invoke when the obtainment of data in the connect method is completed,
   * and provide the actual record obtained from the connection
   */
  onCompletion(data?: T[]): void;

  /**
   * This will invoke when the obtainment process detects error
   */
  onError(status?: number): void;

  /**
   * Connect the data to get the datasource
   */
  connect(): Observable<T[]>;

  /**
   * Disconnect all the subscribers or destroy all memory allocation here
   */
  disconnect(): void;
}
