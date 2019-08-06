import {
  McsEntityBase,
  McsJob,
  ActionStatus,
  EntityRequester
} from '@app/models';
import { Observable } from 'rxjs';

export interface IMcsJobEntity<T extends McsEntityBase> {
  dataChange(): Observable<T[]>;
  getActionMethod(): ActionStatus;
  getEntityRequesterType(): EntityRequester;
  getEntityIdByJob(job: McsJob): Observable<string>;
}
