import { CacheKey } from 'json-object-mapper';
import { McsEnumSerializationBase } from '@app/core';

export enum OrderOrigin {
  Unknown = 0,
  Fusion = 1,
  Crisp = 2,
  MacquarieView = 3
}

export const orderOriginText = {
  [OrderOrigin.Unknown]: 'Unknown',
  [OrderOrigin.Fusion]: 'Fusion',
  [OrderOrigin.Crisp]: 'Crisp',
  [OrderOrigin.MacquarieView]: 'Macquarie View'
};

/**
 * Enumeration serializer and deserializer methods
 */
@CacheKey('OrderOriginSerialization')
export class OrderOriginSerialization
  extends McsEnumSerializationBase<OrderOrigin> {
  constructor() { super(OrderOrigin); }
}
