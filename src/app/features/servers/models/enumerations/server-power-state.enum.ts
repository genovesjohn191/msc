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

export const serverPowerStateText = {
  [ServerPowerState.Unresolved]: 'Unresolved',
  [ServerPowerState.Resolved]: 'Resolved',
  [ServerPowerState.Deployed]: 'Deployed',
  [ServerPowerState.Suspended]: 'Suspended',
  [ServerPowerState.PoweredOn]: 'Running',
  [ServerPowerState.WaitingForInput]: 'Waiting For Input',
  [ServerPowerState.Unknown]: 'Unknown',
  [ServerPowerState.Unrecognised]: 'Unrecognised',
  [ServerPowerState.PoweredOff]: 'Stopped',
  [ServerPowerState.InconsistentState]: 'Inconsistent State',
  [ServerPowerState.Mixed]: 'Mixed'
};

/**
 * Enumeration serializer and deserializer methods
 */
@CacheKey('ServerPowerStateSerialization')
export class ServerPowerStateSerialization
  extends McsEnumSerializationBase<ServerPowerState> {
  constructor() { super(ServerPowerState); }
}
