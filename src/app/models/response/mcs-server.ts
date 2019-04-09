import { JsonProperty } from 'json-object-mapper';
import { CoreDefinition } from '@app/core';
import { getSafeProperty } from '@app/utilities';
import { McsServerOperatingSystemSummary } from './mcs-server-operating-system-summary';
import { McsServerHardware } from './mcs-server-hardware';
import { McsServerCompute } from './mcs-server-compute';
import { McsServerPlatform } from './mcs-server-platform';
import { McsServerMedia } from './mcs-server-media';
import { McsServerStorageDevice } from './mcs-server-storage-device';
import { McsServerNic } from './mcs-server-nic';
import { McsServerVmwareTools } from './mcs-server-vmware-tools';
import { McsServerSnapshot } from './mcs-server-snapshot';
import {
  VmPowerState,
  VmPowerStateSerialization,
  vmPowerStateText
} from '../enumerations/vm-power-state.enum';
import {
  ServiceType,
  ServiceTypeSerialization
} from '../enumerations/service-type.enum';
import {
  ServerCommand,
  serverCommandActiveText
} from '../enumerations/server-command.enum';
import { McsEntityBase } from '../common/mcs-entity.base';
import { PlatformType } from '../enumerations/platform-type.enum';
import { McsServerOsUpdatesDetails } from './mcs-server-os-updates-details';
import { ServerType } from '../enumerations/server-type.enum';

export class McsServer extends McsEntityBase {
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

  @JsonProperty({ type: McsServerVmwareTools })
  public vmwareTools: McsServerVmwareTools;

  @JsonProperty({ type: McsServerPlatform })
  public platform: McsServerPlatform;

  @JsonProperty({ type: McsServerNic })
  public nics: McsServerNic[];

  @JsonProperty({ type: McsServerStorageDevice })
  public storageDevices: McsServerStorageDevice[];

  @JsonProperty({ type: McsServerMedia })
  public media: McsServerMedia[];

  @JsonProperty({ type: McsServerSnapshot })
  public snapshots: McsServerSnapshot[];

  @JsonProperty({ type: McsServerOperatingSystemSummary })
  public operatingSystem: McsServerOperatingSystemSummary;

  @JsonProperty({ type: McsServerHardware })
  public hardware: McsServerHardware;

  @JsonProperty({ type: McsServerCompute })
  public compute: McsServerCompute;

  @JsonProperty({ type: McsServerCompute })
  public osUpdateDetails: McsServerOsUpdatesDetails;

  @JsonProperty({
    type: VmPowerState,
    serializer: VmPowerStateSerialization,
    deserializer: VmPowerStateSerialization
  })
  public powerState: VmPowerState;

  @JsonProperty({
    type: ServiceType,
    serializer: ServiceTypeSerialization,
    deserializer: ServiceTypeSerialization
  })
  public serviceType: ServiceType;

  public commandAction: ServerCommand;

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
    this.vmwareTools = undefined;
  }

  /**
   * Returns true when the server is self-managed
   */
  public get isSelfManaged(): boolean {
    return this.serviceType === ServiceType.SelfManaged;
  }

  /**
   * Returns true when the server is manage and the platform is VCloud
   */
  public get isManagedVCloud(): boolean {
    return this.serviceType === ServiceType.Managed &&
      this.platform.type === PlatformType.VCloud;
  }

  /**
   * Returns true when the server is powered on
   */
  public get isPoweredOn(): boolean {
    return this.powerState === VmPowerState.PoweredOn;
  }

  /**
   * Returns true when the server is powered off
   */
  public get isPoweredOff(): boolean {
    return this.powerState === VmPowerState.PoweredOff;
  }

  /**
   * Returns true when server is suspended
   */
  public get isSuspended(): boolean {
    return this.powerState === VmPowerState.Suspended;
  }

  /**
   * Returns the status label of the server
   * based on its power state or command executed
   */
  public get statusLabel(): string {
    return (this.isProcessing) ?
      serverCommandActiveText[this.commandAction] :
      vmPowerStateText[this.powerState];
  }

  /**
   * Returns true when server is executable
   */
  public get executable(): boolean {
    return !this.isProcessing
      && this.powerState !== VmPowerState.Suspended;
  }

  /**
   * Returns true when server is startable
   */
  public get startable(): boolean {
    return this.executable
      && this.powerState === VmPowerState.PoweredOff;
  }

  /**
   * Returns true when server is scaleable
   */
  public get scaleable(): boolean {
    return this.executable && this.isSelfManaged && !this.isDedicated;
  }

  /**
   * Returns true when server is stoppable
   */
  public get stoppable(): boolean {
    return this.executable
      && this.powerState === VmPowerState.PoweredOn;
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
    return !this.isProcessing
      && this.serviceType === ServiceType.SelfManaged
      && !this.isDedicated;
  }

  /**
   * Returns true when server is resumable
   */
  public get resumable(): boolean {
    return !this.isProcessing
      && this.powerState === VmPowerState.Suspended;
  }

  /**
   * Returns true when server is renameable
   */
  public get renameable(): boolean {
    return this.executable && !this.isDedicated;
  }

  /**
   * Returns true when server can reset the password
   */
  public get canResetPassword(): boolean {
    return this.executable && !this.isDedicated;
  }

  /**
   * Returns true when server is cloneable
   */
  public get cloneable(): boolean {
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
      case VmPowerState.Unresolved:   // Red
      case VmPowerState.Deployed:
      case VmPowerState.Unknown:
      case VmPowerState.Unrecognised:
      case VmPowerState.PoweredOff:
        stateIconKey = CoreDefinition.ASSETS_SVG_STATE_STOPPED;
        break;

      case VmPowerState.Resolved:     // Amber
      case VmPowerState.WaitingForInput:
      case VmPowerState.InconsistentState:
      case VmPowerState.Mixed:
        stateIconKey = CoreDefinition.ASSETS_SVG_STATE_RESTARTING;
        break;

      case VmPowerState.Suspended:    // Grey
        stateIconKey = CoreDefinition.ASSETS_SVG_STATE_SUSPENDED;
        break;

      case VmPowerState.PoweredOn:    // Green
      default:
        stateIconKey = CoreDefinition.ASSETS_SVG_STATE_RUNNING;
        break;
    }
    return stateIconKey;
  }

  /**
   * Returns the resource name of the server, otherwise it will set to Others
   */
  public get resourceName(): string {
    let _resourceName = getSafeProperty(this.platform, (obj) => obj.resourceName);
    return _resourceName || 'Others';
  }

  /**
   * Returns true when the current server is dedicated
   */
  public get isDedicated(): boolean {
    return getSafeProperty(this.platform, (obj) => obj.type) === PlatformType.VCenter;
  }

  /**
   * Returns true when the current server is deleting
   */
  public get isDeleting(): boolean {
    return this.commandAction === ServerCommand.Delete
      && this.isProcessing;
  }

  /**
   * Returns true if the server is windows, false otherwise
   */
  public get isWindows(): boolean {
    return this.operatingSystem.type === ServerType.Windows;
  }
}
