import { Observable } from 'rxjs';
import { DataStatus } from '@app/models';

// TODO: This should transfered app/utilities/interfaces
export interface McsDataSource<T> {
  connect(): Observable<T[]>;
  disconnect(): void;
  onCompletion(data?: T[]): void;
  dataStatusChange(): Observable<DataStatus>;
}
