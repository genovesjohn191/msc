import { ServerIpAllocationMode } from '../enumerations/server-ip-allocation-mode.enum';

export class ServerNetwork {
  public id: string;
  public index: number;
  public name: string;
  public ipAddress: string;
  public macAddress: string;
  public isPrimary: boolean;
  public ipAllocationMode: ServerIpAllocationMode;
}
