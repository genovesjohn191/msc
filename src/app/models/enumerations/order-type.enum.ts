import { CacheKey } from 'json-object-mapper';
import { McsEnumSerializationBase } from '@app/core';

export enum OrderType {
  New = 1,
  Change = 2,
  Cancel = 3,
  Unknown
}

export const orderTypeText = {
  [OrderType.New]: 'New',
  [OrderType.Change]: 'Change',
  [OrderType.Cancel]: 'Cancel',
  [OrderType.Unknown]: 'Unknown',
};

/**
 * Enumeration serializer and deserializer methods
 */
@CacheKey('OrderTypeSerialization')
export class OrderTypeSerialization
  extends McsEnumSerializationBase<OrderType> {
  constructor() { super(OrderType); }
}
