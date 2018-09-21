import { McsEnumSerializationBase } from '@app/core';
import { CacheKey } from 'json-object-mapper';

export enum RunningStatus {
  NotRunning = 0,
  Running = 1
}

/**
 * Enumeration serializer and deserializer methods
 */
@CacheKey('RunningStatusSerialization')
export class RunningStatusSerialization
  extends McsEnumSerializationBase<RunningStatus> {
  constructor() { super(RunningStatus); }
}
