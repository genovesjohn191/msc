import { McsEnumSerializationBase } from '../../../../core';

export enum ServerRunningStatus {
  NotRunning = 0,
  Running = 1
}

/**
 * Enumeration serializer and deserializer methods
 */
export class ServerRunningStatusSerialization
  extends McsEnumSerializationBase<ServerRunningStatus> {
  constructor() { super(ServerRunningStatus); }
}
