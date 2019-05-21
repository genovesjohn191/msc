import { CacheKey } from 'json-object-mapper';
import { McsEnumSerializationBase } from '@app/core';

export enum ServiceLevel {
  Unknown = 0,
  First,
  Enhanced,
  Business,
  NotApplicable
}

export const serviceLevelText = {
  [ServiceLevel.Unknown]: 'Unknown',
  [ServiceLevel.First]: 'First',
  [ServiceLevel.Enhanced]: 'Enhanced',
  [ServiceLevel.Business]: 'Business',
  [ServiceLevel.NotApplicable]: 'Not Applicable'
};

/**
 * Enumeration serializer and deserializer methods
 */
@CacheKey('ServiceLevelSerialization')
export class ServiceLevelSerialization
  extends McsEnumSerializationBase<ServiceLevel> {
  constructor() { super(ServiceLevel); }
}
