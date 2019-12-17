import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

export enum OrderIdType {
  CreateManagedServer = 'servers.vcloud.provision',
  CreateAddOnVmBackup = 'backups.vm.provision',
  CreateAddOnServerBackup = 'backups.server.provision',
  CreateAddOnAntiVirus = 'hostsecurity.av.provision',
  CreateAddOnHids = 'hostsecurity.hids.provision',
  CreateAddOnFirewall = 'firewall.provision',
  ScaleManageServer = 'servers.vcloud.update',
  VdcScale = 'resources.vdc.compute.update',
  VdcStorageExpand = 'resources.vdc.storage.update',
  VdcStorageCreate = 'resources.vdc.storage.new',
  RaiseInviewLevel = 'servers.inview.raise',
  AddAntiVirus = 'hostsecurity.av.provision', // TODO: Verify with API, same order id type with addons
  AddHids = 'hostsecurity.hids.provision' // TODO: Verify with API, same order id type with addons
}

/**
 * Enumeration serializer and deserializer methods
 */
export class OrderIdTypeSerialization
  extends McsEnumSerializationBase<OrderIdType> {
  constructor() { super(OrderIdType); }
}
