import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

export enum ExtenderType {
  PublicCloudExtenderMtAz,
  PublicCloudExtenderCustomerSource,
  ExtenderCustomerSource,
  ExtenderMtAz
}

export const extenderTypeText = {
  [ExtenderType.PublicCloudExtenderMtAz]: 'Azure Extend',
  [ExtenderType.PublicCloudExtenderCustomerSource]: 'Azure Extend',
  [ExtenderType.ExtenderCustomerSource]: 'LAUNCH™ Extender',
  [ExtenderType.ExtenderMtAz]: 'LAUNCH™ Extender'
};

/**
 * Enumeration serializer and deserializer methods
 */
export class ExtenderTypeSerialization
  extends McsEnumSerializationBase<ExtenderType> {
  constructor() { super(ExtenderType); }
}
