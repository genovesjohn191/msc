import { ServerPerformanceScale } from './server-performance-scale';
import { ServerManageStorage } from './server-manage-storage';
import { ServerIpAddress } from './server-ip-address';

export class ServerCreateSelfManaged {
  public isValid: boolean;
  public targetServerName: string;

  public vApp: string;
  public vTemplate: string;
  public catalog: string;
  public performanceScale: ServerPerformanceScale;
  public serverManageStorage: ServerManageStorage;
  public networkName: string;
  public ipAddress: ServerIpAddress;
}
