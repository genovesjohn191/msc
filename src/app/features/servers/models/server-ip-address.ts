import { ServerIpAllocationMode } from './enumerations/server-ip-allocation-mode.enum';

export class ServerIpAddress {
  public customIpAddress: string;
  public ipAllocationMode: ServerIpAllocationMode;
  public valid: boolean;
}
