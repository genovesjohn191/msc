import { ServerPerformanceScale } from './server-performance-scale';
import { ServerManageStorage } from './server-manage-storage';
import { ServerIpAddress } from './server-ip-address';
import { ServerVApp } from './response/server-vapp';
import { Server } from './response/server';
import { ServerNetwork } from './response/server-network';
import { ServerImageType } from './enumerations/server-image-type.enum';

export class ServerCreateDetails {
  public serverName: string;
  public targetServer: Server;
  public vApp: ServerVApp;
  public imageType: ServerImageType;
  public image: string;
  public performanceScale: ServerPerformanceScale;
  public serverManageStorage: ServerManageStorage;
  public network: ServerNetwork;
  public ipAddress: ServerIpAddress;
}
