import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

export enum ItemChangeType {
  ConfigChange = 'ConfigChange',
  Change = 'Change',
  Unknown = 'Unknown'
}

/**
 * Enumeration serializer and deserializer methods
 */
export class ItemChangeTypeSerialization
  extends McsEnumSerializationBase<ItemChangeType> {
  constructor() { super(ItemChangeType); }
}
