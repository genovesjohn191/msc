import { JsonProperty } from 'json-object-mapper';
import { McsServerCreateStorage } from './mcs-server-create-storage';
import { McsServerCreateNic } from './mcs-server-create-nic';
import {
  ServerImageType,
  ServerImageTypeSerialization
} from '../enumerations/server-image-type.enum';
import { McsApiJobRequestBase } from '../mcs-api-job-request-base';

export class McsServerCreate extends McsApiJobRequestBase {
  public platform: string;
  public resource: string;
  public name: string;
  public cpuCount: number;
  public memoryMB: number;
  public image: string;
  public target: string;
  public serviceId: string;

  @JsonProperty({ type: McsServerCreateStorage })
  public storage: McsServerCreateStorage;

  @JsonProperty({ type: McsServerCreateNic })
  public network: McsServerCreateNic;

  @JsonProperty({
    type: ServerImageType,
    serializer: ServerImageTypeSerialization,
    deserializer: ServerImageTypeSerialization
  })
  public imageType: ServerImageType;

  constructor() {
    super();
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
  }
}
