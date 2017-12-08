import { ServerIpAllocationMode } from '../enumerations/server-ip-allocation-mode.enum';

export class ServerNetworkSummary {
  public id: string;
  public name: string;
  public index: number;
  public isPrimary: boolean;
  public ipAllocationMode: ServerIpAllocationMode;
  public ipAddress: string;
  public macAddress: string;
}
