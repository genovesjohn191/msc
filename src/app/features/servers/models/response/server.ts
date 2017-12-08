import { ServerOperatingSystemSummary } from './server-operating-system-summary';
import { ServerHardware } from './server-hardware';
import { ServerComputeSummary } from './server-compute-summary';
import { ServerPlatformSummary } from './server-platform-summary';
import { ServerMedia } from './server-media';
import { ServerFileSystem } from './server-file-system';
import { ServerStorageDevice } from './server-storage-device';
import { ServerNicSummary } from './server-nic-summary';
import { ServerPowerState } from '../enumerations/server-power-state.enum';
import { ServerServiceType } from '../enumerations/server-service-type.enum';

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
  public vApp: string;
  public portalUrl: string;
  public vCloudId: string;
  public vCenterId: string;
  public isTemplate: boolean;
}
