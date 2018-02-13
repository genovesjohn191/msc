import { ServerIpAllocationMode } from '../enumerations/server-ip-allocation-mode.enum';

export class ServerNicSummary {
  public id: string;
  public name: string;
  public ipAddress: string[];
  public adminStatus: string;
  public operStatus: string;
  public maxSpeed: string;
  public mtu: number;
  public macAddress: string;
  public isSubInterface: boolean;
  public vlanId: number;
  public portgroup: string;
  public networkName: string;
  public index: number;
  public isPrimary: boolean;
  public ipAllocationMode: ServerIpAllocationMode;

  // Additional flag not related to API response
  public isProcessing: boolean;
}
