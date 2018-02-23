import { ServerCompute } from './server-compute';
import { ServerStorage } from './server-storage';
import { ServerNetwork } from './server-network';
import { ServerCatalogItem } from './server-catalog-item';
import { ServerVApp } from './server-vapp';
import {
  ServerServiceType,
  ServerServiceTypeSerialization
} from '../enumerations/server-service-type.enum';
import {
  ServerPlatformType,
  ServerPlatformTypeSerialization
} from '../enumerations/server-platform-type.enum';
import { JsonProperty } from 'json-object-mapper';

export class ServerResource {
  public compute: ServerCompute;
  public storage: ServerStorage[];
  public networks: ServerNetwork[];
  public catalogItems: ServerCatalogItem[];
  public vApps: ServerVApp[];
  public id: string;
  public name: string;

  @JsonProperty({
    type: ServerPlatformType,
    serializer: ServerPlatformTypeSerialization,
    deserializer: ServerPlatformTypeSerialization
  })
  public platform: ServerPlatformType;
  public environmentName: string;

  @JsonProperty({
    type: ServerServiceType,
    serializer: ServerServiceTypeSerialization,
    deserializer: ServerServiceTypeSerialization
  })
  public serviceType: ServerServiceType;
  public availabilityZone: string;
  public portalUrl: string;

  constructor() {
    this.compute = undefined;
    this.storage = undefined;
    this.networks = undefined;
    this.catalogItems = undefined;
    this.vApps = undefined;
    this.id = undefined;
    this.name = undefined;
    this.platform = undefined;
    this.environmentName = undefined;
    this.serviceType = undefined;
    this.availabilityZone = undefined;
    this.portalUrl = undefined;
  }
}
