import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

export enum ItemType {
  New = 1,
  Change = 2,
  Cancel = 3,
  Unknown
}

export const itemTypeText = {
  [ItemType.New]: 'New',
  [ItemType.Change]: 'Change',
  [ItemType.Cancel]: 'Cancel',
  [ItemType.Unknown]: 'Unknown',
};

/**
 * Enumeration serializer and deserializer methods
 */
export class ItemTypeSerialization
  extends McsEnumSerializationBase<ItemType> {
  constructor() { super(ItemType); }
}
