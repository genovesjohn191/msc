import { ServerIpAllocationMode } from './enumerations/server-ip-allocation-mode.enum';
import { ServerNetwork } from './response/server-network';

export class ServerManageNetwork {
  public network: ServerNetwork;
  public customIpAddress: string;
  public ipAllocationMode: ServerIpAllocationMode;
  public valid: boolean;
}
