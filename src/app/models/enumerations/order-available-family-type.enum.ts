import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

export enum OrderAvailableFamilyType {
  Compute = 0,
  Security,
  Services
}

export const orderAvailableFamilyTypeText = {
  [OrderAvailableFamilyType.Compute]: 'Compute',
  [OrderAvailableFamilyType.Security]: 'Security',
  [OrderAvailableFamilyType.Services]: 'Services'
};

/**
 * Enumeration serializer and deserializer methods
 */
export class OrderAvailableFamilyTypeSerialization
  extends McsEnumSerializationBase<OrderAvailableFamilyType> {
  constructor() { super(OrderAvailableFamilyType); }
}
