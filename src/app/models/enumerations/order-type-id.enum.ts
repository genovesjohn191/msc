import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

export enum OrderIdType {
  CreateManagedServer = 'servers.vcloud.provision',
  CreateAddOnAntiVirus = 'hostsecurity.av.provision',
  CreateAddOnHids = 'hostsecurity.hids.provision',
  CreateAddOnFirewall = 'firewall.provision',
  ScaleManageServer = 'servers.vcloud.update',
  VdcScale = 'resources.vdc.compute.update',
  VdcStorageExpand = 'resources.vdc.storage.update',
  VdcStorageCreate = 'resources.vdc.storage.new',
  RaiseInviewLevel = 'servers.inview.raise',
}

/**
 * Enumeration serializer and deserializer methods
 */
export class OrderIdTypeSerialization
  extends McsEnumSerializationBase<OrderIdType> {
  constructor() { super(OrderIdType); }
}
