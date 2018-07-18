import { CacheKey } from 'json-object-mapper';
import { McsEnumSerializationBase } from '../../../../core';

export enum OrderType {
  New = 1,
  Change = 2,
  Cancel = 3
}

/**
 * Enumeration serializer and deserializer methods
 */
@CacheKey('OrderTypeSerialization')
export class OrderTypeSerialization
  extends McsEnumSerializationBase<OrderType> {
  constructor() { super(OrderType); }
}
