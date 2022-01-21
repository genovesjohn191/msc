import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

export enum ApplicationRecoveryType {
  Unknown,
  AzureApplicationRecovery,
  ApplicationRecovery
}

export const applicationRecoveryTypeText = {
  [ApplicationRecoveryType.Unknown]: 'Unknown',
  [ApplicationRecoveryType.AzureApplicationRecovery]: 'Azure Recover',
  [ApplicationRecoveryType.ApplicationRecovery]: 'LAUNCH™ Application Recovery'
};

/**
 * Enumeration serializer and deserializer methods
 */
export class ApplicationRecoveryTypeSerialization
  extends McsEnumSerializationBase<ApplicationRecoveryType> {
  constructor() { super(ApplicationRecoveryType); }
}
