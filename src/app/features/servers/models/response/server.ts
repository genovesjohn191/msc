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
import {
  ServerPowerState,
  ServerPowerStateSerialization
} from '../enumerations/server-power-state.enum';
import {
  ServerServiceType,
  ServerServiceTypeSerialization
} from '../enumerations/server-service-type.enum';
import { ServerCommand } from '../enumerations/server-command.enum';
import { JsonProperty } from 'json-object-mapper';

export class Server {
  public id: any;
  public name: string;
  public hostname: string;
  public managementName: string;
  public serviceId: string;

  @JsonProperty({
    type: ServerServiceType,
    serializer: ServerServiceTypeSerialization,
    deserializer: ServerServiceTypeSerialization
  })
  public serviceType: ServerServiceType;
  public availabilityZone: string;
  public companyId: string;
  public managementIpAddress: string;
  public ipAddress: string;
  public instanceId: string;
  public operatingSystem: ServerOperatingSystemSummary;
  public hardware: ServerHardware;
  public compute: ServerComputeSummary;

  @JsonProperty({
    type: ServerPowerState,
    serializer: ServerPowerStateSerialization,
    deserializer: ServerPowerStateSerialization
  })
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

  constructor() {
    this.id = undefined;
    this.name = undefined;
    this.hostname = undefined;
    this.managementName = undefined;
    this.serviceId = undefined;
    this.serviceType = undefined;
    this.availabilityZone = undefined;
    this.companyId = undefined;
    this.managementIpAddress = undefined;
    this.ipAddress = undefined;
    this.instanceId = undefined;
    this.operatingSystem = undefined;
    this.hardware = undefined;
    this.compute = undefined;
    this.powerState = undefined;
    this.platform = undefined;
    this.nics = undefined;
    this.fileSystem = undefined;
    this.storageDevice = undefined;
    this.media = undefined;
    this.snapshots = undefined;
    this.vApp = undefined;
    this.portalUrl = undefined;
    this.vCloudId = undefined;
    this.vCenterId = undefined;
    this.isTemplate = undefined;
    this.isOperable = undefined;
    this.vmwareTools = undefined;
  }

  /**
   * Return true when server is executable
   */
  public get executable(): boolean {
    return this.isOperable
      && !this.isProcessing
      && this.powerState !== ServerPowerState.Suspended;
  }
}
