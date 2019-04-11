import { CacheKey } from 'json-object-mapper';
import { McsEnumSerializationBase } from '@app/core';

export enum OrderIdType {
  CreateManagedServer = '2e127596-db28-2300-26f6-cae43a9619e8',
  CreateAddOnAntiMalware = '93d17596-db28-2300-26f6-cae43a9619e4',
  CreateAddOnFirewall = 'firewall.provision',
  ScaleManageServer = 'b3caf568-db33-ef04-f539-6e314a961913'
}

/**
 * Enumeration serializer and deserializer methods
 */
@CacheKey('OrderIdTypeSerialization')
export class OrderIdTypeSerialization
  extends McsEnumSerializationBase<OrderIdType> {
  constructor() { super(OrderIdType); }
}
