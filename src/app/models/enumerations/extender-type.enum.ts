import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

export enum ExtenderType {
  PublicCloudExtenderMtAz,
  PublicCloudExtenderCustomerSource,
  ExtenderCustomerSource,
  ExtenderMtAz
}

export const extenderTypeText = {
  [ExtenderType.PublicCloudExtenderMtAz]: 'Public Cloud Extender MT AZ',
  [ExtenderType.PublicCloudExtenderCustomerSource]: 'Public Cloud Extender Customer Source',
  [ExtenderType.ExtenderCustomerSource]: 'Extender Customer Source',
  [ExtenderType.ExtenderMtAz]: 'Extender MT AZ'
};

/**
 * Enumeration serializer and deserializer methods
 */
export class ExtenderTypeSerialization
  extends McsEnumSerializationBase<ExtenderType> {
  constructor() { super(ExtenderType); }
}
