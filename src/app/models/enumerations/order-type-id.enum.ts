import { CacheKey } from 'json-object-mapper';
import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

export enum OrderIdType {
  CreateManagedServer = 'servers.vcloud.provision',
  CreateAddOnAntiMalware = 'av.provision',
  CreateAddOnFirewall = 'firewall.provision',
  ScaleManageServer = 'servers.vcloud.update',
  VdcStorageExpand = 'resources.vdc.storage.update',
  VdcStorageCreate = 'resources.vdc.storage.new'
}

/**
 * Enumeration serializer and deserializer methods
 */
@CacheKey('OrderIdTypeSerialization')
export class OrderIdTypeSerialization
  extends McsEnumSerializationBase<OrderIdType> {
  constructor() { super(OrderIdType); }
}
