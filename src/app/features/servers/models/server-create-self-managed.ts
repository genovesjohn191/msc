import { ServerPerformanceScale } from './server-performance-scale';
import { ServerManageStorage } from './server-manage-storage';
import { ServerIpAddress } from './server-ip-address';
import { ServerCreateType } from './enumerations/server-create-type.enum';
import { ServerImageType } from './enumerations/server-image-type.enum';

export class ServerCreateSelfManaged {
  public serverName: string;
  public type: ServerCreateType;
  public isValid: boolean;
  public targetServer: string;
  public vApp: string;
  public imageType: ServerImageType;
  public image: string;
  public catalog: string;
  public performanceScale: ServerPerformanceScale;
  public serverManageStorage: ServerManageStorage;
  public networkName: string;
  public ipAddress: ServerIpAddress;
}
