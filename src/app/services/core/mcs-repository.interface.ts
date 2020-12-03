import { Observable } from 'rxjs';

import { McsQueryParam } from '@app/models';

import { McsRepositoryConfig } from './mcs-repository.config';

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

  sortRecords(predicate: (first: T, second: T) => number): void;

  clearData(): void;

  getConfig(): McsRepositoryConfig<T>;
  dataClear(): Observable<void>;
}
