import { Observable } from 'rxjs';
import { McsJob } from '@app/models';

export interface IMcsJobable {
  jobsChange(): Observable<McsJob[]>;
  setJobs(...jobs: McsJob[]): void;
}
