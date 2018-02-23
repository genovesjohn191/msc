import { ServerClientObject } from './server-client-object';
import { ServerCreateStorage } from './server-create-storage';
import { ServerCreateNetwork } from './server-create-network';
import {
  ServerImageType,
  ServerImageTypeSerialization
} from '../enumerations/server-image-type.enum';
import { JsonProperty } from 'json-object-mapper';

export class ServerCreate {
  public platform: string;
  public resource: string;
  public name: string;
  public cpuCount: number;
  public memoryMB: number;

  @JsonProperty({
    type: ServerImageType,
    serializer: ServerImageTypeSerialization,
    deserializer: ServerImageTypeSerialization
  })
  public imageType: ServerImageType;
  public image: string;
  public target: string;
  public serviceId: string;
  public storage: ServerCreateStorage;
  public network: ServerCreateNetwork;
  public clientReferenceObject: ServerClientObject;

  constructor() {
    this.platform = undefined;
    this.resource = undefined;
    this.name = undefined;
    this.cpuCount = undefined;
    this.memoryMB = undefined;
    this.imageType = undefined;
    this.image = undefined;
    this.target = undefined;
    this.serviceId = undefined;
    this.storage = undefined;
    this.network = undefined;
    this.clientReferenceObject = undefined;
  }
}
