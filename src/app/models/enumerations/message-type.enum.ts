import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

export enum MessageType {
  Info,
  Alert
}

export const messageTypeText = {
  [MessageType.Info]: 'Info',
  [MessageType.Alert]: 'Alert'
};

/**
 * Enumeration serializer and deserializer methods
 */
export class MessageTypeSerialization
  extends McsEnumSerializationBase<MessageType> {
  constructor() { super(MessageType); }
}
