import { CacheKey } from 'json-object-mapper';
import { McsEnumSerializationBase } from '@app/core';

export enum OrderIdType {
  CreateManagedServer = 'servers.vcloud.provision',
  CreateAddOnAntiMalware = 'av.provision',
  CreateAddOnFirewall = 'firewall.provision'
}

/**
 * Enumeration serializer and deserializer methods
 */
@CacheKey('OrderIdTypeSerialization')
export class OrderIdTypeSerialization
  extends McsEnumSerializationBase<OrderIdType> {
  constructor() { super(OrderIdType); }
}
