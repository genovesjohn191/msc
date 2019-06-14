import { Observable } from 'rxjs';
import {
  McsQueryParam,
  ObtainmentMethod
} from '@app/models';

export interface McsRepository<T> {
  getAll(): Observable<T[]>;
  filterBy(query: McsQueryParam): Observable<T[]>;
  getBy(predicate: (entity: T) => boolean): Observable<T>;
  getById(id: string, method?: ObtainmentMethod): Observable<T>;
  getByIdAsync(id: string): Observable<T>;
  getByIdAsync(id: string, completedCallback?: () => void): Observable<T>;
  getTotalRecordsCount(): number;

  addOrUpdate(entity: T, insertIndex?: number): void;
  delete(entity: T): void;
  deleteBy(predicate: (entity: T) => boolean);
  deleteById(id: string): void;

  clearData(): void;

  dataChange(): Observable<T[]>;
  dataClear(): Observable<void>;
}
