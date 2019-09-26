import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

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
export class OrderOriginSerialization
  extends McsEnumSerializationBase<OrderOrigin> {
  constructor() { super(OrderOrigin); }
}
