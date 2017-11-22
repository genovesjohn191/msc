import { ServerIpAllocationMode } from '../enumerations/server-ip-allocation-mode.enum';

export class ServerCreateNetwork {
  public name: string;
  public ipAllocationMode: ServerIpAllocationMode;
  public ipAddress: string;
}
