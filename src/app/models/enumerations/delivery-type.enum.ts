import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

export enum DeliveryType {
  Standard = 1,
  Accelerated = 2
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
