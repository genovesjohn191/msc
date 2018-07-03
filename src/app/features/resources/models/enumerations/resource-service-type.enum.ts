import { McsEnumSerializationBase } from '../../../../core';
import { CacheKey } from 'json-object-mapper';

export enum ResourceServiceType {
  Managed = 0,
  SelfManaged = 1
}

export const resourceServiceTypeText = {
  [ResourceServiceType.Managed]: 'Managed',
  [ResourceServiceType.SelfManaged]: 'Self-Managed'
};

/**
 * Enumeration serializer and deserializer methods
 */
@CacheKey('ResourceServiceTypeSerialization')
export class ResourceServiceTypeSerialization
  extends McsEnumSerializationBase<ResourceServiceType> {
  constructor() { super(ResourceServiceType); }
}
