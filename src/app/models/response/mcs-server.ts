import { JsonProperty } from 'json-object-mapper';
import {
  getSafeProperty,
  isNullOrEmpty,
  CommonDefinition
} from '@app/utilities';
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
  InviewLevel,
  InviewLevelSerialization,
  inviewLevelText
} from '../enumerations/inview-level.enum';
import { McsEntityBase } from '../common/mcs-entity.base';
import { PlatformType } from '../enumerations/platform-type.enum';
import { Os } from '../enumerations/os.enum';
import { McsServerOsUpdatesDetails } from './mcs-server-os-updates-details';

export class McsServer extends McsEntityBase {
  public name: string = undefined;
  public hostname: string = undefined;
  public serviceId: string = undefined;
  public availabilityZone: string = undefined;
  public companyId: string = undefined;
  public ipAddress: string = undefined;
  public instanceId: string = undefined;
  public vApp: string = undefined;
  public portalUrl: string = undefined;
  public vCloudId: string = undefined;
  public vCenterId: string = undefined;
  public osAutomationAvailable: boolean = undefined;
  public serviceChangeAvailable: boolean = undefined;

  @JsonProperty({ type: McsServerVmwareTools })
  public vmwareTools: McsServerVmwareTools = undefined;

  @JsonProperty({ type: McsServerPlatform })
  public platform: McsServerPlatform = undefined;

  @JsonProperty({ type: McsServerNic })
  public nics: McsServerNic[] = undefined;

  @JsonProperty({ type: McsServerStorageDevice })
  public storageDevices: McsServerStorageDevice[] = undefined;

  @JsonProperty({ type: McsServerMedia })
  public media: McsServerMedia[] = undefined;

  @JsonProperty({ type: McsServerSnapshot })
  public snapshots: McsServerSnapshot[] = undefined;

  @JsonProperty({ type: McsServerOperatingSystemSummary })
  public operatingSystem: McsServerOperatingSystemSummary = undefined;

  @JsonProperty({ type: McsServerHardware })
  public hardware: McsServerHardware = undefined;

  @JsonProperty({ type: McsServerCompute })
  public compute: McsServerCompute = undefined;

  @JsonProperty({ type: McsServerCompute })
  public osUpdateDetails: McsServerOsUpdatesDetails = undefined;

  @JsonProperty({
    type: VmPowerState,
    serializer: VmPowerStateSerialization,
    deserializer: VmPowerStateSerialization
  })
  public powerState: VmPowerState = undefined;

  @JsonProperty({
    type: ServiceType,
    serializer: ServiceTypeSerialization,
    deserializer: ServiceTypeSerialization
  })
  public serviceType: ServiceType = undefined;

  @JsonProperty({
    type: InviewLevel,
    serializer: InviewLevelSerialization,
    deserializer: InviewLevelSerialization
  })
  private inviewLevel: InviewLevel = undefined;

  /**
   * Returns the inview level
   */
  public get inViewLevel(): InviewLevel {
    if (isNullOrEmpty(this.inviewLevel)) {
      return InviewLevel.None;
    }
    return this.inviewLevel;
  }

  /**
   * Returns the inview level text content
   */
  public get inviewLevelLabel(): string {
    return inviewLevelText[this.inViewLevel];
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
      this.processingText :
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
    let isScaleable = this.executable && !this.isDedicated;
    return this.isSelfManaged ? isScaleable : isScaleable && this.serviceChangeAvailable;
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
        stateIconKey = CommonDefinition.ASSETS_SVG_STATE_STOPPED;
        break;

      case VmPowerState.Resolved:     // Amber
      case VmPowerState.WaitingForInput:
      case VmPowerState.InconsistentState:
      case VmPowerState.Mixed:
        stateIconKey = CommonDefinition.ASSETS_SVG_STATE_RESTARTING;
        break;

      case VmPowerState.Suspended:    // Grey
        stateIconKey = CommonDefinition.ASSETS_SVG_STATE_SUSPENDED;
        break;

      case VmPowerState.PoweredOn:    // Green
      default:
        stateIconKey = CommonDefinition.ASSETS_SVG_STATE_RUNNING;
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
   * Returns true if the server is windows, false otherwise
   */
  public get isWindows(): boolean {
    return getSafeProperty(this.operatingSystem, (obj) => obj.type === Os.Windows);
  }

  /**
   * Returns true if the server inview is standard, false otherwise
   */
  public get isInviewStandard(): boolean {
    return this.inViewLevel === InviewLevel.Standard;
  }

  /**
   * Returns true if the server inview is premium, false otherwise
   */
  public get isInviewPremium(): boolean {
    return this.inViewLevel === InviewLevel.Premium;
  }

  /**
   * Returns true if the server inview is none, false otherwise
   */
  public get isInviewNone(): boolean {
    return this.inViewLevel === InviewLevel.None;
  }
}
