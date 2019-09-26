import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

export enum ProvisioningStatus {
  Error = -1,
  Unknown = 0,
  NotStarted = 1,
  InProgress = 2,
  Completed = 3,
  Cancelled = 4
}

export const provisioningStatusText = {
  [ProvisioningStatus.Error]: 'Error',
  [ProvisioningStatus.Unknown]: 'Unknown',
  [ProvisioningStatus.NotStarted]: 'Not Started',
  [ProvisioningStatus.InProgress]: 'In Progress',
  [ProvisioningStatus.Completed]: 'Completed',
  [ProvisioningStatus.Cancelled]: 'Cancelled',
};

/**
 * Enumeration serializer and deserializer methods
 */
export class ProvisioningStatusSerialization
  extends McsEnumSerializationBase<ProvisioningStatus> {
  constructor() { super(ProvisioningStatus); }
}
