import { Observable } from 'rxjs';
import { McsJob } from '@app/models';

export interface IMcsJobManager {
  jobsChange(): Observable<McsJob[]>;
  setJobs(...jobs: McsJob[]): void;
}
