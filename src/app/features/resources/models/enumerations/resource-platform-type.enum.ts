import { McsEnumSerializationBase } from '../../../../core';
import { CacheKey } from 'json-object-mapper';

export enum ResourcePlatformType {
  VCloud = 0,
  VCenter = 1,
  Ucs = 2
}

export const resourcePlatformTypeText = {
  [ResourcePlatformType.VCloud]: 'VCloud',
  [ResourcePlatformType.VCenter]: 'VCenter',
  [ResourcePlatformType.Ucs]: 'Ucs'
};

/**
 * Enumeration serializer and deserializer methods
 */
@CacheKey('ResourcePlatformTypeSerialization')
export class ResourcePlatformTypeSerialization
  extends McsEnumSerializationBase<ResourcePlatformType> {
  constructor() { super(ResourcePlatformType); }
}
