import { Observable } from 'rxjs';
import { McsQueryParam } from '@app/models';

export interface McsRepository<T> {
  getAll(): Observable<T[]>;
  filterBy(query: McsQueryParam): Observable<T[]>;
  getBy(predicate: (entity: T) => boolean): Observable<T>;
  getById(id: string): Observable<T>;
  getTotalRecordCount(): number;

  addOrUpdate(entity: T): void;
  delete(entity: T): void;
  deleteById(id: string): void;

  dataChange(): Observable<T[]>;
}
