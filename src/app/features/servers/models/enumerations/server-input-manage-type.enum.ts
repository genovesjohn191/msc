import { McsEnumSerializationBase } from '../../../../core';

export enum ServerInputManageType {
  Slider = 0,
  Custom = 1,
  Buttons = 2
}

/**
 * Enumeration serializer and deserializer methods
 */
export class ServerInputManageTypeSerialization
  extends McsEnumSerializationBase<ServerInputManageType> {
  constructor() { super(ServerInputManageType); }
}
