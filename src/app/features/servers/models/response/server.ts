import { ServerOperatingSystemSummary } from './server-operating-system-summary';
import { ServerHardware } from './server-hardware';
import { ServerComputeSummary } from './server-compute-summary';
import { ServerPlatformSummary } from './server-platform-summary';
import { ServerMedia } from './server-media';
import { ServerStorageDevice } from './server-storage-device';
import { ServerNic } from './server-nic';
import { ServerVmwareTools } from './server-vmware-tools';
import { ServerSnapshot } from './server-snapshot';
import {
  ServerPowerState,
  ServerPowerStateSerialization,
  serverPowerStateText
} from '../enumerations/server-power-state.enum';
import {
  ServerServiceType,
  ServerServiceTypeSerialization
} from '../enumerations/server-service-type.enum';
import {
  ServerCommand,
  serverCommandActiveText
} from '../enumerations/server-command.enum';
import { JsonProperty } from 'json-object-mapper';
import {
  CoreDefinition,
  McsEntityBase
} from '../../../../core';

export class Server extends McsEntityBase {
  public name: string;
  public hostname: string;
  public serviceId: string;
  public availabilityZone: string;
  public companyId: string;
  public ipAddress: string;
  public instanceId: string;
  public vApp: string;
  public portalUrl: string;
  public vCloudId: string;
  public vCenterId: string;
  public isTemplate: boolean;

  @JsonProperty({ type: ServerVmwareTools })
  public vmwareTools: ServerVmwareTools;

  @JsonProperty({ type: ServerPlatformSummary })
  public platform: ServerPlatformSummary;

  @JsonProperty({ type: ServerNic })
  public nics: ServerNic[];

  @JsonProperty({ type: ServerStorageDevice })
  public storageDevices: ServerStorageDevice[];

  @JsonProperty({ type: ServerMedia })
  public media: ServerMedia[];

  @JsonProperty({ type: ServerSnapshot })
  public snapshots: ServerSnapshot[];

  @JsonProperty({ type: ServerOperatingSystemSummary })
  public operatingSystem: ServerOperatingSystemSummary;

  @JsonProperty({ type: ServerHardware })
  public hardware: ServerHardware;

  @JsonProperty({ type: ServerComputeSummary })
  public compute: ServerComputeSummary;

  @JsonProperty({
    type: ServerPowerState,
    serializer: ServerPowerStateSerialization,
    deserializer: ServerPowerStateSerialization
  })
  public powerState: ServerPowerState;

  @JsonProperty({
    type: ServerServiceType,
    serializer: ServerServiceTypeSerialization,
    deserializer: ServerServiceTypeSerialization
  })
  public serviceType: ServerServiceType;

  // Additional flag not related to API response
  public isProcessing: boolean;
  public commandAction: ServerCommand;
  public processingText: string;

  constructor() {
    super();
    this.name = undefined;
    this.hostname = undefined;
    this.serviceId = undefined;
    this.serviceType = undefined;
    this.availabilityZone = undefined;
    this.companyId = undefined;
    this.ipAddress = undefined;
    this.instanceId = undefined;
    this.operatingSystem = undefined;
    this.hardware = undefined;
    this.compute = undefined;
    this.powerState = undefined;
    this.platform = undefined;
    this.nics = undefined;
    this.storageDevices = undefined;
    this.media = undefined;
    this.snapshots = undefined;
    this.vApp = undefined;
    this.portalUrl = undefined;
    this.vCloudId = undefined;
    this.vCenterId = undefined;
    this.isTemplate = undefined;
    this.vmwareTools = undefined;
  }

  /**
   * Returns true when the server is powered on
   */
  public get isPoweredOn(): boolean {
    return this.powerState === ServerPowerState.PoweredOn;
  }

  /**
   * Returns true when the server is powered off
   */
  public get isPoweredOff(): boolean {
    return this.powerState === ServerPowerState.PoweredOff;
  }

  /**
   * Returns true when server is suspended
   */
  public get isSuspended(): boolean {
    return this.powerState === ServerPowerState.Suspended;
  }

  /**
   * Returns the status label of the server
   * based on its power state or command executed
   */
  public get statusLabel(): string {
    return (this.isProcessing) ?
      serverCommandActiveText[this.commandAction] :
      serverPowerStateText[this.powerState];
  }

  /**
   * Returns true when server is executable
   */
  public get executable(): boolean {
    return !this.isProcessing
      && this.powerState !== ServerPowerState.Suspended;
  }

  /**
   * Returns true when server is startable
   */
  public get startable(): boolean {
    return this.executable
      && this.powerState === ServerPowerState.PoweredOff;
  }

  /**
   * Returns true when server is stoppable
   */
  public get stoppable(): boolean {
    return this.executable
      && this.powerState === ServerPowerState.PoweredOn;
  }

  /**
   * Returns true when server is restartable
   */
  public get restartable(): boolean {
    return this.stoppable;
  }

  /**
   * Returns true when server is suspendable
   */
  public get suspendable(): boolean {
    return this.stoppable;
  }

  /**
   * Returns true when server is deletable
   */
  public get deletable(): boolean {
    return !this.isProcessing &&
      this.serviceType === ServerServiceType.SelfManaged;
  }

  /**
   * Returns true when server is resumable
   */
  public get resumable(): boolean {
    return !this.isProcessing
      && this.powerState === ServerPowerState.Suspended;
  }

  /**
   * Returns true when server is clonable
   */
  public get clonable(): boolean {
    return this.executable;
  }

  /**
   * Returns true when server console is enabled
   */
  public get consoleEnabled(): boolean {
    return this.isPoweredOn
      && !this.isSuspended;
  }

  /**
   * Return the status Icon key based on the status of the server
   */
  public get powerStateIconKey(): string {
    let stateIconKey: string = '';

    switch (this.powerState) {
      case ServerPowerState.Unresolved:   // Red
      case ServerPowerState.Deployed:
      case ServerPowerState.Unknown:
      case ServerPowerState.Unrecognised:
      case ServerPowerState.PoweredOff:
        stateIconKey = CoreDefinition.ASSETS_SVG_STATE_STOPPED;
        break;

      case ServerPowerState.Resolved:   // Amber
      case ServerPowerState.WaitingForInput:
      case ServerPowerState.InconsistentState:
      case ServerPowerState.Mixed:
        stateIconKey = CoreDefinition.ASSETS_SVG_STATE_RESTARTING;
        break;

      case ServerPowerState.Suspended: // Grey
        stateIconKey = CoreDefinition.ASSETS_SVG_STATE_SUSPENDED;
        break;

      case ServerPowerState.PoweredOn:  // Green
      default:
        stateIconKey = CoreDefinition.ASSETS_SVG_STATE_RUNNING;
        break;
    }
    return stateIconKey;
  }
}
