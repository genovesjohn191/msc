import { JsonProperty } from 'json-object-mapper';
import { McsResourceCompute } from './mcs-resource-compute';
import { McsResourceStorage } from './mcs-resource-storage';
import { McsResourceNetwork } from './mcs-resource-network';
import { McsResourceVApp } from './mcs-resource-vapp';
import { McsResourceCatalog } from './mcs-resource-catalog';
import {
  ServiceType,
  ServiceTypeSerialization,
  serviceTypeText
} from '../enumerations/service-type.enum';
import {
  PlatformType,
  PlatformTypeSerialization,
  platformTypeText
} from '../enumerations/platform-type.enum';
import { McsEntityBase } from '../common/mcs-entity.base';

export class McsResource extends McsEntityBase {
  public name: string;
  public serviceId: string;
  public environmentName: string;
  public availabilityZone: string;
  public portalUrl: string;

  @JsonProperty({ type: McsResourceCompute })
  public compute: McsResourceCompute;

  @JsonProperty({ type: McsResourceStorage })
  public storage: McsResourceStorage[];

  @JsonProperty({ type: McsResourceNetwork })
  public networks: McsResourceNetwork[];

  @JsonProperty({ type: McsResourceCatalog })
  public catalogs: McsResourceCatalog[];

  @JsonProperty({ type: McsResourceVApp })
  public vApps: McsResourceVApp[];

  @JsonProperty({
    type: ServiceType,
    serializer: ServiceTypeSerialization,
    deserializer: ServiceTypeSerialization
  })
  public serviceType: ServiceType;

  @JsonProperty({
    type: PlatformType,
    serializer: PlatformTypeSerialization,
    deserializer: PlatformTypeSerialization
  })
  public platform: PlatformType;

  constructor() {
    super();
    this.compute = undefined;
    this.storage = undefined;
    this.networks = undefined;
    this.catalogs = undefined;
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
   * Returns true when the resource is a self-managed
   */
  public get isSelfManaged(): boolean {
    return this.serviceType === ServiceType.SelfManaged;
  }

  /**
   * Returns service type label
   */
  public get serviceTypeLabel(): string {
    return serviceTypeText[this.serviceType];
  }

  /**
   * Returns platform type label
   */
  public get platformLabel(): string {
    return platformTypeText[this.platform];
  }
}
