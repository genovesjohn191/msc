import { JsonProperty } from 'json-object-mapper';
import { CoreDefinition } from '@app/core';
import { isNullOrEmpty } from '@app/utilities';
import {
  DeviceStatus,
  DeviceStatusSerialization,
  deviceStatusText
} from '../enumerations/device-status.enum';
import {
  ConfigurationStatus,
  ConfigurationStatusSerialization,
  configurationStatusText
} from '../enumerations/configuration-status.enum';
import {
  ConnectionStatus,
  ConnectionStatusSerialization,
  connectionStatusText
} from '../enumerations/connection-status.enum';
import {
  HaMode,
  HaModeSerialization
} from '../enumerations/ha-mode.enum';
import { McsFirewallUtm } from './mcs-firewall-utm';
import { McsFirewallPolicy } from './mcs-firewall-policy';
import { McsEntityBase } from '../common/mcs-entity.base';

export class McsFirewall extends McsEntityBase {
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

  @JsonProperty({ type: McsFirewallPolicy })
  public policies: McsFirewallPolicy[];

  @JsonProperty({ type: McsFirewallUtm })
  public utm: McsFirewallUtm;

  @JsonProperty({
    type: HaMode,
    serializer: HaModeSerialization,
    deserializer: HaModeSerialization
  })
  public haMode: HaMode;

  @JsonProperty({
    type: DeviceStatus,
    serializer: DeviceStatusSerialization,
    deserializer: DeviceStatusSerialization
  })
  public deviceStatus: DeviceStatus;

  @JsonProperty({
    type: ConfigurationStatus,
    serializer: ConfigurationStatusSerialization,
    deserializer: ConfigurationStatusSerialization
  })
  public configurationStatus: ConfigurationStatus;

  @JsonProperty({
    type: ConnectionStatus,
    serializer: ConnectionStatusSerialization,
    deserializer: ConnectionStatusSerialization
  })
  public connectionStatus: ConnectionStatus;

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
    return deviceStatusText[this.deviceStatus];
  }

  /**
   * Returns connection status label
   */
  public get connectionStatusLabel() {
    return connectionStatusText[this.connectionStatus];
  }

  /**
   * Returns configuration status label
   */
  public get configurationStatusLabel() {
    return configurationStatusText[this.configurationStatus];
  }

  /**
   * This will return the device status icon key
   * based on the firewall device status
   */
  public get deviceStatusIconKey(): string {

    let iconKey = '';

    switch (this.deviceStatus) {
      case DeviceStatus.AutoUpdated:
      case DeviceStatus.Installed:
      case DeviceStatus.Retrieved:
      case DeviceStatus.Reverted:
        iconKey = CoreDefinition.ASSETS_SVG_STATE_RUNNING;
        break;

      case DeviceStatus.Aborted:
      case DeviceStatus.Cancelled:
      case DeviceStatus.None:
      case DeviceStatus.SyncFailed:
      case DeviceStatus.Timeout:
      case DeviceStatus.Unknown:
        iconKey = CoreDefinition.ASSETS_SVG_STATE_STOPPED;
        break;

      case DeviceStatus.ChangedConfig:
      case DeviceStatus.CheckedIn:
      case DeviceStatus.InProgress:
      case DeviceStatus.Pending:
      case DeviceStatus.Retry:
      case DeviceStatus.Sched:
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
      case ConnectionStatus.Up:
        iconKey = CoreDefinition.ASSETS_SVG_STATE_RUNNING;
        break;

      case ConnectionStatus.Down:
        iconKey = CoreDefinition.ASSETS_SVG_STATE_STOPPED;
        break;

      case ConnectionStatus.Unknown:
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
      case ConfigurationStatus.InSync:
        iconKey = CoreDefinition.ASSETS_SVG_STATE_RUNNING;
        break;

      case ConfigurationStatus.OutOfSync:
        iconKey = CoreDefinition.ASSETS_SVG_STATE_STOPPED;
        break;

      case ConfigurationStatus.Unknown:
      default:
        iconKey = CoreDefinition.ASSETS_SVG_STATE_RESTARTING;
        break;
    }
    return iconKey;
  }
}
