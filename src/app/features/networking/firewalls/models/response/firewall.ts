import {
  FirewallDeviceStatus,
  FirewallDeviceStatusSerialization
} from '../enumerations/firewall-device-status.enum';
import {
  FirewallConfigurationStatus,
  FirewallConfigurationStatusSerialization
} from '../enumerations/firewall-configuration-status.enum';
import {
  FirewallConnectionStatus,
  FirewallConnectionStatusSerialization
} from '../enumerations/firewall-connection-status.enum';
import {
  FirewallHaMode,
  FirewallHaModeSerialization
} from '../enumerations/firewall-ha-mode.enum';
import { FirewallUtm } from '../response/firewall-utm';
import { JsonProperty } from 'json-object-mapper';

export class Firewall {
  public id: any;
  public serviceId: string;
  public availabilityZone: string;
  public managementName: string;
  public managementIpAddress: string;
  public active: boolean;
  public hardwareVendor: string;
  public cpuCount: number;
  public memoryMb: number;
  public osType: string;
  public osVendor: string;
  public osRelease: string;
  public osVersion: string;
  public serialNumber: string;
  public model: string;
  public companyId: string;
  public snmpVersion: string;
  public haGroupName: string;
  public haRole: string;
  public url: string;

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
    this.id = undefined;
    this.serviceId = undefined;
    this.availabilityZone = undefined;
    this.managementName = undefined;
    this.managementIpAddress = undefined;
    this.active = undefined;
    this.hardwareVendor = undefined;
    this.cpuCount = undefined;
    this.memoryMb = undefined;
    this.osType = undefined;
    this.osVendor = undefined;
    this.osRelease = undefined;
    this.osVersion = undefined;
    this.serialNumber = undefined;
    this.model = undefined;
    this.companyId = undefined;
    this.snmpVersion = undefined;
    this.haGroupName = undefined;
    this.haRole = undefined;
    this.url = undefined;
    this.utm = undefined;
    this.deviceStatus = undefined;
    this.configurationStatus = undefined;
    this.connectionStatus = undefined;
    this.haMode = undefined;
  }
}
