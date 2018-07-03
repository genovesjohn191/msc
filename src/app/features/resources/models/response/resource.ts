import { JsonProperty } from 'json-object-mapper';
import { ResourceCompute } from './resource-compute';
import { ResourceStorage } from './resource-storage';
import { ResourceNetwork } from './resource-network';
import { ResourceCatalogItem } from './resource-catalog-item';
import { ResourceVApp } from './resource-vapp';
import {
  ResourceServiceType,
  ResourceServiceTypeSerialization,
  resourceServiceTypeText
} from '../enumerations/resource-service-type.enum';
import {
  ResourcePlatformType,
  ResourcePlatformTypeSerialization,
  resourcePlatformTypeText
} from '../enumerations/resource-platform-type.enum';
import { McsEntityBase } from '../../../../core';

export class Resource extends McsEntityBase {
  public name: string;
  public serviceId: string;
  public environmentName: string;
  public availabilityZone: string;
  public portalUrl: string;

  @JsonProperty({ type: ResourceCompute })
  public compute: ResourceCompute;

  @JsonProperty({ type: ResourceStorage })
  public storage: ResourceStorage[];

  @JsonProperty({ type: ResourceNetwork })
  public networks: ResourceNetwork[];

  @JsonProperty({ type: ResourceCatalogItem })
  public catalogItems: ResourceCatalogItem[];

  @JsonProperty({ type: ResourceVApp })
  public vApps: ResourceVApp[];

  @JsonProperty({
    type: ResourceServiceType,
    serializer: ResourceServiceTypeSerialization,
    deserializer: ResourceServiceTypeSerialization
  })
  public serviceType: ResourceServiceType;

  @JsonProperty({
    type: ResourcePlatformType,
    serializer: ResourcePlatformTypeSerialization,
    deserializer: ResourcePlatformTypeSerialization
  })
  public platform: ResourcePlatformType;

  constructor() {
    super();
    this.compute = undefined;
    this.storage = undefined;
    this.networks = undefined;
    this.catalogItems = undefined;
    this.vApps = undefined;
    this.serviceId = undefined;
    this.name = undefined;
    this.platform = undefined;
    this.environmentName = undefined;
    this.serviceType = undefined;
    this.availabilityZone = undefined;
    this.portalUrl = undefined;
  }

  /**
   * Returns service type label
   */
  public get serviceTypeLabel(): string {
    return resourceServiceTypeText[this.serviceType];
  }

  /**
   * Returns platform type label
   */
  public get platformLabel(): string {
    return resourcePlatformTypeText[this.platform];
  }
}
