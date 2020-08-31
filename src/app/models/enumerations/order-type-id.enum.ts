import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

export enum OrderIdType {
  CreateManagedServer = 'servers.vcloud.provision',
  CreateAddOnFirewall = 'firewall.provision',
  ScaleManageServer = 'servers.vcloud.update',
  VdcScale = 'resources.vdc.compute.update',
  VdcStorageExpand = 'resources.vdc.storage.update',
  VdcStorageCreate = 'resources.vdc.storage.new',
  RaiseInviewLevel = 'servers.inview.raise',
  ServiceCustomChange = 'services.customRequest',
  ColocationStaffEscort = 'colocation.staffEscort',
  AddAntiVirus = 'hostsecurity.av.provision',
  AddHids = 'hostsecurity.hids.provision',
  AddVmBackup = 'backups.vm.provision',
  AddServerBackup = 'backups.server.provision',
  AddBat = 'backups.bat.provision',
  MsLicenseCountChange = 'microsoft.licenseCount.change',
  MsRequestChange = 'microsoft.subscription.requestChange',
  HostedDnsChange = 'dns.customChange'
}

/**
 * Enumeration serializer and deserializer methods
 */
export class OrderIdTypeSerialization
  extends McsEnumSerializationBase<OrderIdType> {
  constructor() { super(OrderIdType); }
}
