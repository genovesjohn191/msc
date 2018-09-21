import { CacheKey } from 'json-object-mapper';
import { McsEnumSerializationBase } from '@app/core';

export enum OrderIdType {
  CreateManagedServer = 'server.provision.vcloud',
  CreateFirewallAddOn = 'server.firewall.addon'
}

/**
 * Enumeration serializer and deserializer methods
 */
@CacheKey('OrderIdTypeSerialization')
export class OrderIdTypeSerialization
  extends McsEnumSerializationBase<OrderIdType> {
  constructor() { super(OrderIdType); }
}
