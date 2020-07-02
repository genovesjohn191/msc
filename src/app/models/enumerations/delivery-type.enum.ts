import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

export enum DeliveryType {
  Standard,
  Accelerated
}

export const deliveryTypeText = {
  [DeliveryType.Standard]: 'Standard',
  [DeliveryType.Accelerated]: 'Accelerated'
};

/**
 * Enumeration serializer and deserializer methods
 */
export class DeliveryTypeSerialization
  extends McsEnumSerializationBase<DeliveryType> {
  constructor() { super(DeliveryType); }
}
