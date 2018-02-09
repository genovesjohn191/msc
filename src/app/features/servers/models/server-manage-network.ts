import { ServerIpAllocationMode } from './enumerations/server-ip-allocation-mode.enum';

export class ServerManageNic {
  public name: string;
  public isPrimary: boolean;
  public ipAllocationMode: ServerIpAllocationMode;
  public ipAddress: string;
  public clientReferenceObject: any;
}
