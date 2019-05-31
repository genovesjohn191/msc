import { CacheKey } from 'json-object-mapper';
import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

export enum ServiceType {
  Managed = 0,
  SelfManaged = 1,
  Public = 2
}

export const serviceTypeText = {
  [ServiceType.Managed]: 'Managed',
  [ServiceType.SelfManaged]: 'Self-Managed'
};

/**
 * Enumeration serializer and deserializer methods
 */
@CacheKey('ServiceTypeSerialization')
export class ServiceTypeSerialization
  extends McsEnumSerializationBase<ServiceType> {
  constructor() { super(ServiceType); }
}
