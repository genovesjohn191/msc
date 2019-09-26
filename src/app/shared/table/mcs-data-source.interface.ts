import { Observable } from 'rxjs';
import { DataStatus } from '@app/models';

// TODO: This should put in place of shared components utilities
export interface McsDataSource<T> {
  connect(): Observable<T[]>;
  disconnect(): void;
  onCompletion(data?: T[]): void;
  dataStatusChange(): Observable<DataStatus>;
}
