import { ServerOperatingSystemSummary } from './server-operating-system-summary';
import { ServerHardware } from './server-hardware';
import { ServerComputeSummary } from './server-compute-summary';
import { ServerPlatformSummary } from './server-platform-summary';
import { ServerMedia } from './server-media';
import { ServerFileSystem } from './server-file-system';
import { ServerStorageDevice } from './server-storage-device';
import { ServerNicSummary } from './server-nic-summary';
import { ServerVmwareTools } from './server-vmware-tools';
import { ServerSnapshot } from './server-snapshot';
import { ServerPowerState } from '../enumerations/server-power-state.enum';
import { ServerServiceType } from '../enumerations/server-service-type.enum';
import { ServerCommand } from '../enumerations/server-command.enum';

export class Server {
  public id: any;
  public name: string;
  public hostname: string;
  public managementName: string;
  public serviceId: string;
  public serviceType: ServerServiceType;
  public availabilityZone: string;
  public companyId: string;
  public managementIpAddress: string;
  public ipAddress: string;
  public instanceId: string;
  public operatingSystem: ServerOperatingSystemSummary;
  public hardware: ServerHardware;
  public compute: ServerComputeSummary;
  public powerState: ServerPowerState;
  public platform: ServerPlatformSummary;
  public nics: ServerNicSummary[];
  public fileSystem: ServerFileSystem[];
  public storageDevice: ServerStorageDevice[];
  public media: ServerMedia[];
  public snapshots: ServerSnapshot[];
  public vApp: string;
  public portalUrl: string;
  public vCloudId: string;
  public vCenterId: string;
  public isTemplate: boolean;
  public isOperable: boolean;
  public vmwareTools: ServerVmwareTools;

  // Additional flag not related to API response
  public isProcessing: boolean;
  public commandAction: ServerCommand;
  public processingText: string;
  public statusLabel: string;
}
