import {
  McsResourceNetwork,
  IpAllocationMode
} from '@app/models';

export class ServerManageNetwork {
  public network: McsResourceNetwork;
  public customIpAddress: string;
  public ipAllocationMode: IpAllocationMode;
  public valid: boolean;
  public hasChanged: boolean;
}
