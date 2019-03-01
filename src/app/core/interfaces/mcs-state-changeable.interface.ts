import { Observable } from 'rxjs';
import { DataStatus } from '@app/models';

export interface IMcsStateChangeable {
  stateChange(): Observable<DataStatus>;
  setChangeState(state: DataStatus): void;
}
