import { ServerIpAllocationMode } from './enumerations/server-ip-allocation-mode.enum';

export class ServerManageNetwork {
  public name: string;
  public isPrimary: boolean;
  public ipAllocationMode: ServerIpAllocationMode;
  public ipAddress: string;
  public clientReferenceObject: any;
}
