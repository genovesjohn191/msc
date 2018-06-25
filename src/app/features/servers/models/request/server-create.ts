import { ServerClientObject } from './server-client-object';
import { ServerCreateStorage } from './server-create-storage';
import { ServerCreateNic } from './server-create-nic';
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
  public image: string;
  public target: string;
  public serviceId: string;

  @JsonProperty({ type: ServerCreateStorage })
  public storage: ServerCreateStorage;

  @JsonProperty({ type: ServerCreateNic })
  public network: ServerCreateNic;

  @JsonProperty({ type: ServerClientObject })
  public clientReferenceObject: ServerClientObject;

  @JsonProperty({
    type: ServerImageType,
    serializer: ServerImageTypeSerialization,
    deserializer: ServerImageTypeSerialization
  })
  public imageType: ServerImageType;

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
