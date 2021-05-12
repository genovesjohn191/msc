import { Observable } from 'rxjs';

import {
  McsEntityBase,
  McsQueryParam
} from '@app/models';

export interface McsDataContext<T extends McsEntityBase> {
  totalRecordsCount: number;
  getAllRecords(parentId?: string): Observable<T[]>;
  getRecordById(id: string, parentId?: string): Observable<T>;
  filterRecords(query: McsQueryParam, parentId?: string): Observable<T[]>;
}
