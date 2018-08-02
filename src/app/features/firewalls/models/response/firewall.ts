import { JsonProperty } from 'json-object-mapper';
import { FirewallPolicy } from './firewall-policy';
import {
  FirewallDeviceStatus,
  FirewallDeviceStatusSerialization,
  firewallDeviceStatusText
} from '../enumerations/firewall-device-status.enum';
import {
  FirewallConfigurationStatus,
  FirewallConfigurationStatusSerialization,
  firewallConfigurationStatusText
} from '../enumerations/firewall-configuration-status.enum';
import {
  FirewallConnectionStatus,
  FirewallConnectionStatusSerialization,
  firewallConnectionStatusText
} from '../enumerations/firewall-connection-status.enum';
import {
  FirewallHaMode,
  FirewallHaModeSerialization
} from '../enumerations/firewall-ha-mode.enum';
import { FirewallUtm } from '../response/firewall-utm';
import {
  CoreDefinition,
  McsEntityBase
} from '../../../../core';
import { isNullOrEmpty } from '../../../../utilities';

export class Firewall extends McsEntityBase {
  public serviceId: string;
  public availabilityZone: string;
  public managementName: string;
  public managementIpAddress: string;
  public active: boolean;
  public hardwareVendor: string;
  public cpuCount: number;
  public memoryMB: number;
  public osType: string;
  public osVendor: string;
  public osRelease: string;
  public osVersion: string;
  public serialNumber: string;
  public model: string;
  public companyId: string;
  public snmpVersion: string;
  public haRole: string;
  public url: string;

  @JsonProperty({ type: FirewallPolicy })
  public policies: FirewallPolicy[];

  @JsonProperty({ type: FirewallUtm })
  public utm: FirewallUtm;

  @JsonProperty({
    type: FirewallHaMode,
    serializer: FirewallHaModeSerialization,
    deserializer: FirewallHaModeSerialization
  })
  public haMode: FirewallHaMode;

  @JsonProperty({
    type: FirewallDeviceStatus,
    serializer: FirewallDeviceStatusSerialization,
    deserializer: FirewallDeviceStatusSerialization
  })
  public deviceStatus: FirewallDeviceStatus;

  @JsonProperty({
    type: FirewallConfigurationStatus,
    serializer: FirewallConfigurationStatusSerialization,
    deserializer: FirewallConfigurationStatusSerialization
  })
  public configurationStatus: FirewallConfigurationStatus;

  @JsonProperty({
    type: FirewallConnectionStatus,
    serializer: FirewallConnectionStatusSerialization,
    deserializer: FirewallConnectionStatusSerialization
  })
  public connectionStatus: FirewallConnectionStatus;

  constructor() {
    super();
    this.serviceId = undefined;
    this.availabilityZone = undefined;
    this.managementName = undefined;
    this.managementIpAddress = undefined;
    this.active = undefined;
    this.hardwareVendor = undefined;
    this.cpuCount = undefined;
    this.memoryMB = undefined;
    this.osType = undefined;
    this.osVendor = undefined;
    this.osRelease = undefined;
    this.osVersion = undefined;
    this.serialNumber = undefined;
    this.model = undefined;
    this.companyId = undefined;
    this.snmpVersion = undefined;
    this.haRole = undefined;
    this.url = undefined;
    this.policies = undefined;
    this.utm = undefined;
    this.deviceStatus = undefined;
    this.configurationStatus = undefined;
    this.connectionStatus = undefined;
    this.haMode = undefined;
  }

  /**
   * Returns the cpu count label
   */
  public get cpuCountLabel(): string {
    return isNullOrEmpty(this.cpuCount) ? undefined : `${this.cpuCount} CPU`;
  }

  /**
   * Returns device status label
   */
  public get deviceStatusLabel() {
    return firewallDeviceStatusText[this.deviceStatus];
  }

  /**
   * Returns connection status label
   */
  public get connectionStatusLabel() {
    return firewallConnectionStatusText[this.connectionStatus];
  }

  /**
   * Returns configuration status label
   */
  public get configurationStatusLabel() {
    return firewallConfigurationStatusText[this.configurationStatus];
  }

  /**
   * This will return the device status icon key
   * based on the firewall device status
   */
  public get deviceStatusIconKey(): string {

    let iconKey = '';

    switch (this.deviceStatus) {
      case FirewallDeviceStatus.AutoUpdated:
      case FirewallDeviceStatus.Installed:
      case FirewallDeviceStatus.Retrieved:
      case FirewallDeviceStatus.Reverted:
        iconKey = CoreDefinition.ASSETS_SVG_STATE_RUNNING;
        break;

      case FirewallDeviceStatus.Aborted:
      case FirewallDeviceStatus.Cancelled:
      case FirewallDeviceStatus.None:
      case FirewallDeviceStatus.SyncFailed:
      case FirewallDeviceStatus.Timeout:
      case FirewallDeviceStatus.Unknown:
        iconKey = CoreDefinition.ASSETS_SVG_STATE_STOPPED;
        break;

      case FirewallDeviceStatus.ChangedConfig:
      case FirewallDeviceStatus.CheckedIn:
      case FirewallDeviceStatus.InProgress:
      case FirewallDeviceStatus.Pending:
      case FirewallDeviceStatus.Retry:
      case FirewallDeviceStatus.Sched:
      default:
        iconKey = CoreDefinition.ASSETS_SVG_STATE_RESTARTING;
        break;
    }

    return iconKey;
  }

  /**
   * This will return the connection status icon key
   * based on the firewall connection status
   */
  public get connectionStatusIconKey(): string {
    let iconKey = '';

    switch (this.connectionStatus) {
      case FirewallConnectionStatus.Up:
        iconKey = CoreDefinition.ASSETS_SVG_STATE_RUNNING;
        break;

      case FirewallConnectionStatus.Down:
        iconKey = CoreDefinition.ASSETS_SVG_STATE_STOPPED;
        break;

      case FirewallConnectionStatus.Unknown:
      default:
        iconKey = CoreDefinition.ASSETS_SVG_STATE_RESTARTING;
        break;
    }
    return iconKey;
  }

  /**
   * This will return the configuration status icon key
   * based on the firewall configuration status
   */
  public get configurationStatusIconKey(): string {
    let iconKey = '';

    switch (this.configurationStatus) {
      case FirewallConfigurationStatus.InSync:
        iconKey = CoreDefinition.ASSETS_SVG_STATE_RUNNING;
        break;

      case FirewallConfigurationStatus.OutOfSync:
        iconKey = CoreDefinition.ASSETS_SVG_STATE_STOPPED;
        break;

      case FirewallConfigurationStatus.Unknown:
      default:
        iconKey = CoreDefinition.ASSETS_SVG_STATE_RESTARTING;
        break;
    }
    return iconKey;
  }
}
