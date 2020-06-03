import { JsonProperty } from '@app/utilities';
import {
  isNullOrEmpty,
  CommonDefinition
} from '@app/utilities';
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
  @JsonProperty()
  public serviceId: string = undefined;

  @JsonProperty()
  public availabilityZone: string = undefined;

  @JsonProperty()
  public managementName: string = undefined;

  @JsonProperty()
  public managementIpAddress: string = undefined;

  @JsonProperty()
  public active: boolean = undefined;

  @JsonProperty()
  public hardwareVendor: string = undefined;

  @JsonProperty()
  public cpuCount: number = undefined;

  @JsonProperty()
  public memoryMB: number = undefined;

  @JsonProperty()
  public osType: string = undefined;

  @JsonProperty()
  public osVendor: string = undefined;

  @JsonProperty()
  public osRelease: string = undefined;

  @JsonProperty()
  public osVersion: string = undefined;

  @JsonProperty()
  public serialNumber: string = undefined;

  @JsonProperty()
  public model: string = undefined;

  @JsonProperty()
  public companyId: string = undefined;

  @JsonProperty()
  public snmpVersion: string = undefined;

  @JsonProperty()
  public haRole: string = undefined;

  @JsonProperty()
  public haGroupName: string = undefined;

  @JsonProperty()
  public url: string = undefined;

  @JsonProperty({ target: McsFirewallPolicy })
  public policies: McsFirewallPolicy[];

  @JsonProperty({ target: McsFirewallUtm })
  public utm: McsFirewallUtm = undefined;

  @JsonProperty({
    serializer: HaModeSerialization,
    deserializer: HaModeSerialization
  })
  public haMode: HaMode = undefined;

  @JsonProperty({
    serializer: DeviceStatusSerialization,
    deserializer: DeviceStatusSerialization
  })
  public deviceStatus: DeviceStatus = undefined;

  @JsonProperty({
    serializer: ConfigurationStatusSerialization,
    deserializer: ConfigurationStatusSerialization
  })
  public configurationStatus: ConfigurationStatus = undefined;

  @JsonProperty({
    serializer: ConnectionStatusSerialization,
    deserializer: ConnectionStatusSerialization
  })
  public connectionStatus: ConnectionStatus = undefined;

  /**
   * Returns the cpu count label
   */
  public get cpuCountLabel(): string {
    return isNullOrEmpty(this.cpuCount) ? undefined : `${this.cpuCount} CPU`;
  }

  /**
   * Returns device status label
   */
  public get deviceStatusLabel(): string {
    return deviceStatusText[this.deviceStatus];
  }

  /**
   * Returns connection status label
   */
  public get connectionStatusLabel(): string {
    return connectionStatusText[this.connectionStatus];
  }

  /**
   * Returns configuration status label
   */
  public get configurationStatusLabel(): string {
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
        iconKey = CommonDefinition.ASSETS_SVG_STATE_RUNNING;
        break;

      case DeviceStatus.Aborted:
      case DeviceStatus.Cancelled:
      case DeviceStatus.None:
      case DeviceStatus.SyncFailed:
      case DeviceStatus.Timeout:
      case DeviceStatus.Unknown:
        iconKey = CommonDefinition.ASSETS_SVG_STATE_STOPPED;
        break;

      case DeviceStatus.ChangedConfig:
      case DeviceStatus.CheckedIn:
      case DeviceStatus.InProgress:
      case DeviceStatus.Pending:
      case DeviceStatus.Retry:
      case DeviceStatus.Sched:
      default:
        iconKey = CommonDefinition.ASSETS_SVG_STATE_RESTARTING;
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
        iconKey = CommonDefinition.ASSETS_SVG_STATE_RUNNING;
        break;

      case ConnectionStatus.Down:
        iconKey = CommonDefinition.ASSETS_SVG_STATE_STOPPED;
        break;

      case ConnectionStatus.Unknown:
      default:
        iconKey = CommonDefinition.ASSETS_SVG_STATE_RESTARTING;
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
        iconKey = CommonDefinition.ASSETS_SVG_STATE_RUNNING;
        break;

      case ConfigurationStatus.OutOfSync:
        iconKey = CommonDefinition.ASSETS_SVG_STATE_STOPPED;
        break;

      case ConfigurationStatus.Unknown:
      default:
        iconKey = CommonDefinition.ASSETS_SVG_STATE_RESTARTING;
        break;
    }
    return iconKey;
  }
}
