import { McsEnumSerializationBase } from '../../../../core';
import { CacheKey } from 'json-object-mapper';

export enum ServerPowerState {
  Unresolved = 1,
  Resolved = 2,
  Deployed = 3,
  Suspended = 4,
  PoweredOn = 5,
  WaitingForInput = 6,
  Unknown = 7,
  Unrecognised = 8,
  PoweredOff = 9,
  InconsistentState = 10,
  Mixed = 11
}

/**
 * Enumeration serializer and deserializer methods
 */
@CacheKey('ServerPowerStateSerialization')
export class ServerPowerStateSerialization
  extends McsEnumSerializationBase<ServerPowerState> {
  constructor() { super(ServerPowerState); }
}
