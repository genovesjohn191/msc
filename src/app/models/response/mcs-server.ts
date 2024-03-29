import { IMcsServiceOrderStateChangeable } from '@app/core';
import {
  getSafeProperty,
  isNullOrEmpty,
  isNullOrUndefined,
  CommonDefinition,
  JsonProperty
} from '@app/utilities';

import { McsEntityBase } from '../common/mcs-entity.base';
import {
  inviewLevelText,
  InviewLevel,
  InviewLevelSerialization
} from '../enumerations/inview-level.enum';
import { Os } from '../enumerations/os.enum';
import { PlatformType } from '../enumerations/platform-type.enum';
import { HardwareType } from '../enumerations/hardware-type.enum';
import { RunningStatus } from '../enumerations/running-status.enum';
import { ServiceOrderState } from '../enumerations/service-order-state.enum';
import {
  ServiceType,
  ServiceTypeSerialization
} from '../enumerations/service-type.enum';
import { VersionStatus } from '../enumerations/version-status.enum';
import {
  vmPowerStateText,
  VmPowerState,
  VmPowerStateSerialization
} from '../enumerations/vm-power-state.enum';
import { McsServerCompute } from './mcs-server-compute';
import { McsServerHardware } from './mcs-server-hardware';
import { McsServerMedia } from './mcs-server-media';
import { McsServerNic } from './mcs-server-nic';
import { McsServerOperatingSystemSummary } from './mcs-server-operating-system-summary';
import { McsServerOsUpdatesDetails } from './mcs-server-os-updates-details';
import { McsServerPlatform } from './mcs-server-platform';
import { McsServerSnapshot } from './mcs-server-snapshot';
import { McsServerStorageDevice } from './mcs-server-storage-device';
import { McsServerVmwareTools } from './mcs-server-vmware-tools';

export class McsServer extends McsEntityBase implements IMcsServiceOrderStateChangeable {
  @JsonProperty()
  public name: string = undefined;

  @JsonProperty()
  public hostname: string = undefined;

  @JsonProperty()
  public serviceId: string = undefined;

  @JsonProperty()
  public availabilityZone: string = undefined;

  @JsonProperty()
  public companyId: string = undefined;

  @JsonProperty()
  public ipAddress: string = undefined;

  @JsonProperty()
  public instanceId: string = undefined;

  @JsonProperty()
  public vApp: string = undefined;

  @JsonProperty()
  public portalUrl: string = undefined;

  @JsonProperty()
  public vCloudId: string = undefined;

  @JsonProperty()
  public cpuHotPlugEnabled: boolean = undefined;

  @JsonProperty()
  public vCenterId: string = undefined;

  @JsonProperty()
  public osAutomationAvailable: boolean = undefined;

  @JsonProperty()
  public inviewPending: boolean = undefined;

  @JsonProperty()
  public serviceChangeAvailable: boolean = undefined;

  @JsonProperty()
  public billingDescription: string = undefined;

  @JsonProperty({ target: McsServerVmwareTools })
  public vmwareTools: McsServerVmwareTools = undefined;

  @JsonProperty({ target: McsServerPlatform })
  public platform: McsServerPlatform = undefined;

  @JsonProperty({ target: McsServerNic })
  public nics: McsServerNic[] = undefined;

  @JsonProperty({ target: McsServerStorageDevice })
  public storageDevices: McsServerStorageDevice[] = undefined;

  @JsonProperty({ target: McsServerMedia })
  public media: McsServerMedia[] = undefined;

  @JsonProperty({ target: McsServerSnapshot })
  public snapshots: McsServerSnapshot[] = undefined;

  @JsonProperty({ target: McsServerOperatingSystemSummary })
  public operatingSystem: McsServerOperatingSystemSummary = undefined;

  @JsonProperty({ target: McsServerHardware })
  public hardware: McsServerHardware = undefined;

  @JsonProperty({ target: McsServerCompute })
  public compute: McsServerCompute = undefined;

  @JsonProperty({ target: McsServerCompute })
  public osUpdateDetails: McsServerOsUpdatesDetails = undefined;

  @JsonProperty({
    serializer: VmPowerStateSerialization,
    deserializer: VmPowerStateSerialization
  })
  public powerState: VmPowerState = undefined;

  @JsonProperty({
    serializer: ServiceTypeSerialization,
    deserializer: ServiceTypeSerialization
  })
  public serviceType: ServiceType = undefined;

  @JsonProperty({
    serializer: InviewLevelSerialization,
    deserializer: InviewLevelSerialization
  })
  private inviewLevel: InviewLevel = undefined;

  @JsonProperty()
  public diskSizeMB: number = undefined;

  @JsonProperty()
  public snapshotSizeMB: number = undefined;

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
    let isInviewDisplayed = this.isManagedVCloud && this.serviceChangeAvailable;
    return isInviewDisplayed ? inviewLevelText[this.inviewLevel] : inviewLevelText[InviewLevel.None];
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
   * Returns true when the server is manage and the platform is VCenter
   */
  public get isManagedVCenter(): boolean {
    return this.serviceType === ServiceType.Managed &&
      this.platform.type === PlatformType.VCenter;
  }

  /**
   * Returns true when the server is managed and the hardware type is VM
   */
   public get isManagedVM(): boolean {
    return this.serviceType === ServiceType.Managed &&
      this.hardware.type === HardwareType.VM;
  }

  /**
   * Returns true when the server's hardware type is VM
   */
   public get isVM(): boolean {
      return this.hardware.type === HardwareType.VM;
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
    if (!this.isVCloud) { return false; }
    if (!this.executable) { return false; }

    if (this.isSelfManaged || this.serviceChangeAvailable)  {
      return true;
    }

    return false;
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
    if (!this.executable) { return false; }
    if (this.operatingSystem.type === Os.ESX) { return false; }

    return (this.isSelfManaged && this.isVCloud)?
      this.isVMWareToolsRunning : this.osAutomationAvailable;
  }

  /**
   * Returns true when the server can be ordered
   */
  public get canProvision(): boolean {
    return this.isManagedVCloud && this.serviceChangeAvailable;
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
   * Returns true when the current server's platform is vCloud
   */
   public get isVCloud(): boolean {
    return getSafeProperty(this.platform, (obj) => obj.type) === PlatformType.VCloud;
  }

  /**
   * Returns true when the current server's platform is vCenter
   */
   public get isVCenter(): boolean {
    return getSafeProperty(this.platform, (obj) => obj.type) === PlatformType.VCenter;
  }

  /**
   * Returns true when the current server has a VMware platform (any type)
   */
   public get isVMware(): boolean {
     return getSafeProperty(this.platform, (obj) => obj.type) === PlatformType.VCloud ||
       getSafeProperty(this.platform, (obj) => obj.type) === PlatformType.VCenter;
  }

  /**
   * Returns true when the current server has a UCS platform (any type)
   */
   public get isUcs(): boolean {
     return getSafeProperty(this.platform, (obj) => obj.type) === PlatformType.Ucs ||
       getSafeProperty(this.platform, (obj) => obj.type) === PlatformType.UcsCentral ||
       getSafeProperty(this.platform, (obj) => obj.type) === PlatformType.UcsDomain;
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

  /**
   * Returns the status provisioning in bit
   */
  public getServiceOrderState(): ServiceOrderState {
    if (!this.serviceChangeAvailable) {
      return ServiceOrderState.ChangeUnavailable;
    }
    if (this.isProcessing) {
      return ServiceOrderState.Busy;
    }
    if (this.isPoweredOff) {
      return ServiceOrderState.PoweredOff;
    }
    if (!this.osAutomationAvailable) {
      return ServiceOrderState.OsAutomationNotReady;
    }
    if (this.isSuspended) {
      return ServiceOrderState.Suspended;
    }
  }

  /**
   * Returns the status if vmware is installed
   */
  public get isVMWareToolsInstalled(): boolean {
    return (((this.vmwareTools.version !== -1) &&
            !isNullOrUndefined(this.vmwareTools.runningStatus) &&
            !isNullOrUndefined(this.vmwareTools.versionStatus)) &&
            this.vmwareTools.versionStatus !== VersionStatus.NotInstalled);
  }

  /**
   * Returns the status if vmware is running
   */
  public get isVMWareToolsRunning(): boolean {
    return ((this.vmwareTools.runningStatus === RunningStatus.Running) &&
            this.isVMWareToolsInstalled === true);
  }
}
