// TODO: Remove the comments of all the events that are already implemented

import { IOrderEventStrategy } from './order-event.strategy';
import { ServerVCloudUpdateEvent } from './events/server-vcloud-update.event';
import { ServerVCloudCreateEvent } from './events/server-vcloud-create.event';
import { ServerInviewRaiseEvent } from './events/server-inview-raise.event';
import { ServerBackupProvisionEvent } from './events/server-backup-provision.event';
// import { VmBackupProvisionEvent } from './events/vm-backup-provision.event';
import { VdcStorageUpdateEvent } from './events/vdc-storage-update.event';
import { VdcComputeUpdateEvent } from './events/vdc-compute-update.event';
import { SecurityHidsProvisionEvent } from './events/security-hids-provision';
import { SecurityAvProvisionEvent } from './events/security-av-provision';

export type OrderEventRecord = Record<string, IOrderEventStrategy>;

export const orderEventMap: OrderEventRecord = {
  'servers.vcloud.update': new ServerVCloudUpdateEvent(),
  'servers.inview.raise': new ServerInviewRaiseEvent(),
  'servers.vcloud.provision': new ServerVCloudCreateEvent(),
  'backups.server.provision': new ServerBackupProvisionEvent(),
  // 'backups.vm.provision': new VmBackupProvisionEvent(),
  'resources.vdc.storage.update': new VdcStorageUpdateEvent(),
  'resources.vdc.compute.update': new VdcComputeUpdateEvent(),
  'hostsecurity.hids.provision': new SecurityHidsProvisionEvent(),
  'hostsecurity.av.provision': new SecurityAvProvisionEvent()
};
