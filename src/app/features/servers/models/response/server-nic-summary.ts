import { ServerIpAllocationMode } from '../enumerations/server-ip-allocation-mode.enum';

export class ServerNicSummary {
  public id: string;
  public name: string;
  public index: number;
  public isPrimary: boolean;
  public ipAllocationMode: ServerIpAllocationMode;
  public ipAddress: string;
  public macAddress: string;

  // Additional flag not related to API response
  public isProcessing: boolean;
}
