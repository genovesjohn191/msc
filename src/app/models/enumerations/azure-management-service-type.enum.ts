import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

export enum AzureManagementServiceType {
  Essentials,
  Managed
}

export const AzureManagementServiceTypeText = {
  [AzureManagementServiceType.Essentials]: 'Essentials',
  [AzureManagementServiceType.Managed]: 'Managed'
};

/**
 * Enumeration serializer and deserializer methods
 */
export class AzureManagementServiceTypeSerialization
  extends McsEnumSerializationBase<AzureManagementServiceType> {
  constructor() { super(AzureManagementServiceType); }
}
