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
  ColocationDeviceRestart = 'colocation.deviceRestart',
  AddAntiVirus = 'hostsecurity.av.provision',
  AddHids = 'hostsecurity.hids.provision',
  AddVmBackup = 'backups.vm.provision',
  AddServerBackup = 'backups.server.provision',
  AddBat = 'backups.bat.provision',
  MsLicenseCountChange = 'microsoft.licenseCount.change',
  MsRequestChange = 'microsoft.subscription.requestChange',
  HostedDnsChange = 'dns.customRequest',
  ColocationRemoteHands = 'colocation.remoteHands',
  ServerRequestPatch = 'servers.patchRequest',
  SimpleFirewallChangeAdd = 'firewall.simpleChange.add',
  SimpleFirewallChangeRemove = 'firewall.simpleChange.remove',
  SimpleFirewallChangeModify = 'firewall.simpleChange.modify',
  ChangeInternetPortPlan = 'internetPort.change',
  AzureProfessionalServiceRequest = 'publicCloud.professionalServices'
}

/**
 * Enumeration serializer and deserializer methods
 */
export class OrderIdTypeSerialization
  extends McsEnumSerializationBase<OrderIdType> {
  constructor() { super(OrderIdType); }
}
