import { ServerManageScale } from './server-manage-scale';
import { ServerManageStorage } from './server-manage-storage';
import { ServerManageNetwork } from './server-manage-network';
import { ServerVApp } from './response/server-vapp';
import { Server } from './response/server';
import { ServerImageType } from './enumerations/server-image-type.enum';

export class ServerCreateDetails {
  public serverName: string;
  public targetServer: Server;
  public vApp: ServerVApp;
  public imageType: ServerImageType;
  public image: string;
  public serverScale: ServerManageScale;
  public serverManageStorage: ServerManageStorage;
  public serverNetwork: ServerManageNetwork;
}
