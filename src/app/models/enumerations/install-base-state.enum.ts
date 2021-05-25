import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

export enum InstallBaseState {
  Unknown = 0,
  Active,
  Inactive
}

export const installBaseStateText = {
  [InstallBaseState.Unknown]: 'Unknown',
  [InstallBaseState.Active]: 'Active',
  [InstallBaseState.Inactive]: 'Inactive'
};

/**
 * Enumeration serializer and deserializer methods
 */
export class InstallBaseStateSerialization
  extends McsEnumSerializationBase<InstallBaseState> {
  constructor() { super(InstallBaseState); }
}
