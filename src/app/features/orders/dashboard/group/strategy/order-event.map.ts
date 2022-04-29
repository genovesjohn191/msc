import { IOrderEventStrategy } from './order-event.strategy';
import { ServerVCloudUpdateEvent } from './events/server-vcloud-update.event';
import { ServerVCloudCreateEvent } from './events/server-vcloud-create.event';
import { ServerInviewRaiseEvent } from './events/server-inview-raise.event';
import { ServerBackupProvisionEvent } from './events/server-backup-provision.event';
import { VmBackupProvisionEvent } from './events/vm-backup-provision.event';
import { VdcStorageUpdateEvent } from './events/vdc-storage-update.event';
import { VdcComputeUpdateEvent } from './events/vdc-compute-update.event';
import { SecurityHidsProvisionEvent } from './events/security-hids-provision.event';
import { SecurityAvProvisionEvent } from './events/security-av-provision.event';
import { BatProvisionEvent } from './events/bat-provision.event';
import { MsLicenseCountChangeEvent } from './events/ms-license-count-change.event';
import { MsServiceRequestChangeEvent } from './events/ms-service-request-change.event';
import { ServiceCustomChangeEvent } from './events/service-custom-change.event';
import { HostedDnsChangeEvent } from './events/hosted-dns-change.event';
import { ColocationStaffEscortEvent } from './events/colocation-staff-escort.event';
import { ColocationDeviceRestartEvent } from './events/colocation-device-restart.event';
import { ColocationRemoteHandsEvent } from './events/colocation-remote-hands.event';
import { ServerPatchRequestEvent } from './events/server-request-patch.event';
import { SimpleFirewallChangeAddEvent } from './events/simple-firewall-change-add.event';
import { SimpleFirewallChangeRemoveEvent } from './events/simple-firewall-change-remove.event';
import { SimpleFirewallChangeModifyEvent } from './events/simple-firewall-change-modify.event';
import { ChangeInternetPortPlanEvent } from './events/change-internet-port-plan.event';
import { AzureProfessionalServiceRequestEvent } from './events/azure-professional-service-request.event';
import { BackupRestoreRequestEvent } from './events/backup-restore-request.event';
import { ComplexFirewallChangeEvent } from './events/complex-firewall-change.event';
export type OrderEventRecord = Record<string, IOrderEventStrategy>;

export const orderEventMap: OrderEventRecord = {
  'servers.vcloud.update': new ServerVCloudUpdateEvent(),
  'servers.inview.raise': new ServerInviewRaiseEvent(),
  'servers.vcloud.provision': new ServerVCloudCreateEvent(),
  'servers.patchRequest': new ServerPatchRequestEvent(),
  'backups.server.provision': new ServerBackupProvisionEvent(),
  'backups.vm.provision': new VmBackupProvisionEvent(),
  'backups.bat.provision': new BatProvisionEvent(),
  'resources.vdc.storage.update': new VdcStorageUpdateEvent(),
  'resources.vdc.compute.update': new VdcComputeUpdateEvent(),
  'hostsecurity.hids.provision': new SecurityHidsProvisionEvent(),
  'hostsecurity.av.provision': new SecurityAvProvisionEvent(),
  'microsoft.licenseCount.change': new MsLicenseCountChangeEvent(),
  'microsoft.subscription.requestChange': new MsServiceRequestChangeEvent(),
  'services.customRequest': new ServiceCustomChangeEvent(),
  'dns.customRequest': new HostedDnsChangeEvent(),
  'colocation.staffEscort': new ColocationStaffEscortEvent(),
  'colocation.deviceRestart': new ColocationDeviceRestartEvent(),
  'colocation.remoteHands': new ColocationRemoteHandsEvent(),
  'firewall.simpleChange.add': new SimpleFirewallChangeAddEvent(),
  'firewall.simpleChange.remove': new SimpleFirewallChangeRemoveEvent(),
  'firewall.simpleChange.modify': new SimpleFirewallChangeModifyEvent(),
  'firewall.complexChange': new ComplexFirewallChangeEvent(),
  'internetPort.change': new ChangeInternetPortPlanEvent(),
  'publicCloud.professionalServices': new AzureProfessionalServiceRequestEvent(),
  'backup.requestRestore': new BackupRestoreRequestEvent(),
};
