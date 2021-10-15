import { JsonProperty } from '@app/utilities';
import { isNullOrEmpty } from '@app/utilities';
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
  @JsonProperty()
  public name: string = undefined;

  @JsonProperty()
  public serviceId: string = undefined;

  @JsonProperty()
  public environmentName: string = undefined;

  @JsonProperty()
  public availabilityZone: string = undefined;

  @JsonProperty()
  public portalUrl: string = undefined;

  @JsonProperty()
  public serviceChangeAvailable: boolean = undefined;

  @JsonProperty({ target: McsResourceCompute })
  public compute: McsResourceCompute = undefined;

  @JsonProperty({ target: McsResourceStorage })
  public storage: McsResourceStorage[] = undefined;

  @JsonProperty({ target: McsResourceNetwork })
  public networks: McsResourceNetwork[] = undefined;

  @JsonProperty({ target: McsResourceCatalog })
  public catalogs: McsResourceCatalog[] = undefined;

  @JsonProperty({ target: McsResourceVApp })
  public vApps: McsResourceVApp[] = undefined;

  @JsonProperty()
  public billingDescription: string = undefined;

  @JsonProperty({
    serializer: ServiceTypeSerialization,
    deserializer: ServiceTypeSerialization
  })
  public serviceType: ServiceType = undefined;

  @JsonProperty({
    serializer: PlatformTypeSerialization,
    deserializer: PlatformTypeSerialization
  })
  public platform: PlatformType = undefined;

  /**
   * Returns true when the resource has networks
   */
  public get hasNetworks(): boolean {
    return !isNullOrEmpty(this.networks);
  }

  /**
   * Returns true when the resource has storage
   */
  public get hasStorage(): boolean {
    return !isNullOrEmpty(this.storage);
  }

  /**
   * Returns true when the resource is a self-managed
   */
  public get isSelfManaged(): boolean {
    return this.serviceType === ServiceType.SelfManaged;
  }

  /**
   * Returns true when the current resource is dedicated
   */
  public get isDedicated(): boolean {
    return this.platform === PlatformType.VCenter;
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

  /**
   * Returns true when resource is scaleable
   */
  public get scaleable(): boolean {
    return !this.isDedicated;
  }
}
