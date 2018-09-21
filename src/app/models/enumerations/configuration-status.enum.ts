import { CacheKey } from 'json-object-mapper';
import { McsEnumSerializationBase } from '@app/core';

export enum ConfigurationStatus {
  Unknown,
  InSync,
  OutOfSync
}

export const configurationStatusText = {
  [ConfigurationStatus.Unknown]: 'Unknown',
  [ConfigurationStatus.InSync]: 'InSync',
  [ConfigurationStatus.OutOfSync]: 'OutOfSync'
};

/**
 * Enumeration serializer and deserializer methods
 */
@CacheKey('ConfigurationStatusSerialization')
export class ConfigurationStatusSerialization
  extends McsEnumSerializationBase<ConfigurationStatus> {
  constructor() { super(ConfigurationStatus); }
}
