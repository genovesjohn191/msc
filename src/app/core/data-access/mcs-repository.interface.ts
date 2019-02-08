import { Observable } from 'rxjs';
import {
  McsQueryParam,
  ActionStatus
} from '@app/models';

export interface McsRepository<T> {
  getAll(): Observable<T[]>;
  filterBy(query: McsQueryParam): Observable<T[]>;
  getBy(predicate: (entity: T) => boolean): Observable<T>;
  getById(id: string): Observable<T>;
  getTotalRecordsCount(): number;

  addOrUpdate(entity: T, insertIndex?: number): void;
  delete(entity: T): void;
  deleteBy(predicate: (entity: T) => boolean);
  deleteById(id: string): void;

  dataChange(): Observable<ActionStatus>;
}
