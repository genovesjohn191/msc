import { McsEnumSerializationBase } from '@app/core';
import { CacheKey } from 'json-object-mapper';

export enum VmPowerState {
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

export const vmPowerStateText = {
  [VmPowerState.Unresolved]: 'Unresolved',
  [VmPowerState.Resolved]: 'Resolved',
  [VmPowerState.Deployed]: 'Deployed',
  [VmPowerState.Suspended]: 'Suspended',
  [VmPowerState.PoweredOn]: 'Running',
  [VmPowerState.WaitingForInput]: 'Waiting For Input',
  [VmPowerState.Unknown]: 'Unknown',
  [VmPowerState.Unrecognised]: 'Unrecognised',
  [VmPowerState.PoweredOff]: 'Stopped',
  [VmPowerState.InconsistentState]: 'Inconsistent State',
  [VmPowerState.Mixed]: 'Mixed'
};

/**
 * Enumeration serializer and deserializer methods
 */
@CacheKey('VmPowerStateSerialization')
export class VmPowerStateSerialization
  extends McsEnumSerializationBase<VmPowerState> {
  constructor() { super(VmPowerState); }
}
