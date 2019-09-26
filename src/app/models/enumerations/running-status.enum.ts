import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

export enum RunningStatus {
  NotRunning = 0,
  Running = 1
}

/**
 * Enumeration serializer and deserializer methods
 */
export class RunningStatusSerialization
  extends McsEnumSerializationBase<RunningStatus> {
  constructor() { super(RunningStatus); }
}
