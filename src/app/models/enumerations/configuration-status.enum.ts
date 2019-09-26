import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

export enum ConfigurationStatus {
  Unknown,
  InSync,
  OutOfSync
}

export const configurationStatusText = {
  [ConfigurationStatus.Unknown]: 'Unknown',
  [ConfigurationStatus.InSync]: 'In Sync',
  [ConfigurationStatus.OutOfSync]: 'Out Of Sync'
};

/**
 * Enumeration serializer and deserializer methods
 */
export class ConfigurationStatusSerialization
  extends McsEnumSerializationBase<ConfigurationStatus> {
  constructor() { super(ConfigurationStatus); }
}
