import { McsEnumSerializationBase } from '../../../../core';
import { CacheKey } from 'json-object-mapper';

export enum ServerRunningStatus {
  NotRunning = 0,
  Running = 1
}

/**
 * Enumeration serializer and deserializer methods
 */
@CacheKey('ServerRunningStatusSerialization')
export class ServerRunningStatusSerialization
  extends McsEnumSerializationBase<ServerRunningStatus> {
  constructor() { super(ServerRunningStatus); }
}
