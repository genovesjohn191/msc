import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

export enum OrderAvailablePlatformType {
  PrivateCloud = 0,
  PublicCloud
}

export const orderAvailablePlatformTypeText = {
  [OrderAvailablePlatformType.PrivateCloud]: 'Private Cloud',
  [OrderAvailablePlatformType.PublicCloud]: 'Public Cloud'
};

/**
 * Enumeration serializer and deserializer methods
 */
export class OrderAvailablePlatformTypeSerialization
  extends McsEnumSerializationBase<OrderAvailablePlatformType> {
  constructor() { super(OrderAvailablePlatformType); }
}
