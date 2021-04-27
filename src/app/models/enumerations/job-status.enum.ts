import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

export enum JobStatus {
  Pending = 0,
  Active = 1,
  Completed = 2,
  Cancelled = 3,
  Failed = 4,
  TimedOut = 5,
  SessionExpired = 6
}

export const jobStatusText = {
  [JobStatus.Pending]: 'Pending',
  [JobStatus.Active]: 'Active',
  [JobStatus.Completed]: 'Completed',
  [JobStatus.Cancelled]: 'Cancelled',
  [JobStatus.Failed]: 'Failed',
  [JobStatus.TimedOut]: 'Timed Out',
  [JobStatus.SessionExpired]: 'Session Expired'
};


/**
 * Enumeration serializer and deserializer methods
 */
export class JobStatusSerialization
  extends McsEnumSerializationBase<JobStatus> {
  constructor() { super(JobStatus); }
}
