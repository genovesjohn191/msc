import { McsEnumSerializationBase } from '@app/core';
import { CacheKey } from 'json-object-mapper';

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
@CacheKey('JobStatusSerialization')
export class JobStatusSerialization
  extends McsEnumSerializationBase<JobStatus> {
  constructor() { super(JobStatus); }
}
