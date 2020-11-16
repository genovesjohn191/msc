import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

export enum WorkflowType {
  ProvisionVirtualMachine = 'servers.vcloud.provision',
  ChangeVm = 'servers.vcloud.update',
  DeprovisionVm = 'servers.vcloud.deprovision',
  AddAntiVirus = 'hostsecurity.av.provision',
  AddHids = 'hostsecurity.hids.provision',
  AddVmBackup = 'backups.vm.provision',
  AddServerBackup = 'backups.server.provision'
}

/**
 * Enumeration serializer and deserializer methods
 */
export class WorkflowTypeSerialization
  extends McsEnumSerializationBase<WorkflowType> {
  constructor() { super(WorkflowType); }
}
