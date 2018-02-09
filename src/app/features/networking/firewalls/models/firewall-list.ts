import { FirewallConnectionStatus } from './enumerations/firewall-connection-status.enum';

export class FirewallList {
  public id: any;
  public managementName: string;
  public haGroupName: string;
  public haRole: string;
  public connectionStatus: FirewallConnectionStatus;
}
