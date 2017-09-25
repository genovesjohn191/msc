import { FirewallDeviceStatus } from '../enumerations/firewall-device-status.enum';
import { FirewallConfigurationStatus } from '../enumerations/firewall-configuration-status.enum';
import { FirewallConnectionStatus } from '../enumerations/firewall-connection-status.enum';
import { FirewallHaMode } from '../enumerations/firewall-ha-mode.enum';
import { FirewallUtm } from '../response/firewall-utm';

export class Firewall {
  public id: any;
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
  public deviceStatus: FirewallDeviceStatus;
  public configurationStatus: FirewallConfigurationStatus;
  public connectionStatus: FirewallConnectionStatus;
  public companyId: string;
  public snmpVersion: string;
  public haGroupName: string;
  public haMode: FirewallHaMode;
  public haRole: string;
  public url: string;
  public utm: FirewallUtm;
}
