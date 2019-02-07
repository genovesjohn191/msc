import { CacheKey } from 'json-object-mapper';
import { McsEnumSerializationBase } from '@app/core';

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
@CacheKey('ConfigurationStatusSerialization')
export class ConfigurationStatusSerialization
  extends McsEnumSerializationBase<ConfigurationStatus> {
  constructor() { super(ConfigurationStatus); }
}
