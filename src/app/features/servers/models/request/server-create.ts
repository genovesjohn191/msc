import { ServerClientObject } from './server-client-object';
import { ServerCreateStorage } from './server-create-storage';
import { ServerCreateNetwork } from './server-create-network';
import { ServerImageType } from '../enumerations/server-image-type.enum';

export class ServerCreate {
  public platform: string;
  public resource: string;
  public name: string;
  public cpuCount: number;
  public memoryMB: number;
  public imageType: ServerImageType;
  public image: string;
  public target: string;
  public serviceId: string;
  public storage: ServerCreateStorage;
  public network: ServerCreateNetwork;
  public clientReferenceObject: ServerClientObject;
}
