import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

export enum ExtenderType {
  Unknown,
  AzureExtend,
  LaunchExtender
}

export const extenderTypeText = {
  [ExtenderType.Unknown]: 'Unknown',
  [ExtenderType.AzureExtend]: 'Azure Extend',
  [ExtenderType.LaunchExtender]: 'LAUNCH™ Extender'
};

/**
 * Enumeration serializer and deserializer methods
 */
export class ExtenderTypeSerialization
  extends McsEnumSerializationBase<ExtenderType> {
  constructor() { super(ExtenderType); }
}
