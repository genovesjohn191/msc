import { ServerIpAllocationMode } from './enumerations/server-ip-allocation-mode.enum';
import { ResourceNetwork } from '../../resources';

export class ServerManageNetwork {
  public network: ResourceNetwork;
  public customIpAddress: string;
  public ipAllocationMode: ServerIpAllocationMode;
  public valid: boolean;
}
