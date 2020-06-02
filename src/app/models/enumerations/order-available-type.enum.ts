import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

export enum OrderAvailableType {
  Product = 0
}

export const orderAvailableTypeText = {
  [OrderAvailableType.Product]: 'Product'
};

/**
 * Enumeration serializer and deserializer methods
 */
export class OrderAvailableTypeSerialization
  extends McsEnumSerializationBase<OrderAvailableType> {
  constructor() { super(OrderAvailableType); }
}
