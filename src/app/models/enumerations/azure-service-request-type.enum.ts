import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

export enum AzureServiceRequestType {
  Custom = 0,
  CloudHealth = 1
}

export const azureServiceRequestTypeText = {
  [AzureServiceRequestType.Custom]: 'Custom',
  [AzureServiceRequestType.CloudHealth]: 'CloudHealth'
};

/**
 * Enumeration serializer and deserializer methods
 */
export class AzureServiceRequestTypeSerialization
  extends McsEnumSerializationBase<AzureServiceRequestType> {
  constructor() { super(AzureServiceRequestType); }
}