import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

export enum OrderAvailableGroupType {
  Servers = 0,
  Backup,
  Vdc,
  HostSecurity,
  Licensing
}

export const orderAvailableGroupTypeText = {
  [OrderAvailableGroupType.Servers]: 'Servers',
  [OrderAvailableGroupType.Backup]: 'Backup',
  [OrderAvailableGroupType.Vdc]: 'Vdc',
  [OrderAvailableGroupType.HostSecurity]: 'HostSecurity',
  [OrderAvailableGroupType.Licensing]: 'Licensing'
};

/**
 * Enumeration serializer and deserializer methods
 */
export class OrderAvailableGroupTypeSerialization
  extends McsEnumSerializationBase<OrderAvailableGroupType> {
  constructor() { super(OrderAvailableGroupType); }
}
