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
  public id: string;
  public serviceId: string;
  public name: string;
  public environmentName: string;
  public availabilityZone: string;
  public portalUrl: string;

  @JsonProperty({ type: ServerCompute })
  public compute: ServerCompute;

  @JsonProperty({ type: ServerStorage })
  public storage: ServerStorage[];

  @JsonProperty({ type: ServerNetwork })
  public networks: ServerNetwork[];

  @JsonProperty({ type: ServerCatalogItem })
  public catalogItems: ServerCatalogItem[];

  @JsonProperty({ type: ServerVApp })
  public vApps: ServerVApp[];

  @JsonProperty({
    type: ServerServiceType,
    serializer: ServerServiceTypeSerialization,
    deserializer: ServerServiceTypeSerialization
  })
  public serviceType: ServerServiceType;

  @JsonProperty({
    type: ServerPlatformType,
    serializer: ServerPlatformTypeSerialization,
    deserializer: ServerPlatformTypeSerialization
  })
  public platform: ServerPlatformType;

  constructor() {
    this.compute = undefined;
    this.storage = undefined;
    this.networks = undefined;
    this.catalogItems = undefined;
    this.vApps = undefined;
    this.id = undefined;
    this.serviceId = undefined;
    this.name = undefined;
    this.platform = undefined;
    this.environmentName = undefined;
    this.serviceType = undefined;
    this.availabilityZone = undefined;
    this.portalUrl = undefined;
  }
}
