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

/**
 * Enumeration serializer and deserializer methods
 */
export class JobStatusSerialization
  extends McsEnumSerializationBase<JobStatus> {
  constructor() { super(JobStatus); }
}
