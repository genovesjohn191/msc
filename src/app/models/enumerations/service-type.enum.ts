import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

export enum ServiceType {
  Managed = 0,
  SelfManaged = 1,
  Public = 2
}

export const serviceTypeText = {
  [ServiceType.Managed]: 'Managed',
  [ServiceType.SelfManaged]: 'Self-Managed',
  [ServiceType.Public]: 'Public',
};

/**
 * Enumeration serializer and deserializer methods
 */
export class ServiceTypeSerialization
  extends McsEnumSerializationBase<ServiceType> {
  constructor() { super(ServiceType); }
}
