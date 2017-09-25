import { FirewallConnectionStatus } from './enumerations/firewall-connection-status.enum';

export class FirewallList {
  public id: any;
  public name: string;
  public haGroupName: string;
  public connectionStatus: FirewallConnectionStatus;
}
