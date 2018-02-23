import { McsEnumSerializationBase } from '../../../../core';

export enum ServerServiceType {
  Managed = 0,
  SelfManaged = 1
}

/**
 * Enumeration serializer and deserializer methods
 */
export class ServerServiceTypeSerialization
  extends McsEnumSerializationBase<ServerServiceType> {
  constructor() { super(ServerServiceType); }
}
