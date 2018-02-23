import { McsEnumSerializationBase } from '../../../../core';

export enum ServerVersionStatus {
  Unmanaged = 0,
  SupportedOld = 1,
  SupportedNew = 2,
  Current = 3,
  TooOld = 4,
  NotInstalled = 5
}

/**
 * Enumeration serializer and deserializer methods
 */
export class ServerVersionStatusSerialization
  extends McsEnumSerializationBase<ServerVersionStatus> {
  constructor() { super(ServerVersionStatus); }
}
