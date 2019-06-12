import {
  McsEntityBase,
  McsQueryParam
} from '@app/models';
import { Observable } from 'rxjs';

export interface McsDataContext<T extends McsEntityBase> {
  totalRecordsCount: number;
  getAllRecords(): Observable<T[]>;
  getRecordById(id: string): Observable<T>;
  filterRecords(query: McsQueryParam): Observable<T[]>;
}