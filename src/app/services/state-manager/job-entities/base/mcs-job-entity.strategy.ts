import { Observable } from 'rxjs';
import {
  McsJob,
  McsEntityBase
} from '@app/models';

export abstract class McsJobEntityStrategy<T extends McsEntityBase, R> {
  public abstract dataChange(): Observable<T[]>;
  public abstract getExistingEntityDetails(job: McsJob): Observable<T>;
  public abstract getUpdatedEntityDetails(job: McsJob): Observable<T>;
  public abstract updateEntityState(entity: T, job: McsJob): void;
  public abstract clearEntityState(entity: T, job: McsJob): void;
  public abstract getReferenceObjectKey(): keyof R;
}
