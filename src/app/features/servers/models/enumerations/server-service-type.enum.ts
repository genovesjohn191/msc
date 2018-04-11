import { McsEnumSerializationBase } from '../../../../core';
import { CacheKey } from 'json-object-mapper';

export enum ServerServiceType {
  Managed = 0,
  SelfManaged = 1
}

export const serverServiceTypeText = {
  [ServerServiceType.Managed]: 'Managed',
  [ServerServiceType.SelfManaged]: 'Self-Managed'
};

/**
 * Enumeration serializer and deserializer methods
 */
@CacheKey('ServerServiceTypeSerialization')
export class ServerServiceTypeSerialization
  extends McsEnumSerializationBase<ServerServiceType> {
  constructor() { super(ServerServiceType); }
}
