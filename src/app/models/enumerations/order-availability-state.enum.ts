import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

export enum OrderAvailabilityState {
  Active = 0,
  ComingSoon
}

export const orderAvailabilityStateText = {
  [OrderAvailabilityState.Active]: 'Active',
  [OrderAvailabilityState.ComingSoon]: 'ComingSoon'
};

/**
 * Enumeration serializer and deserializer methods
 */
export class OrderAvailabilityStateSerialization
  extends McsEnumSerializationBase<OrderAvailabilityState> {
  constructor() { super(OrderAvailabilityState); }
}
