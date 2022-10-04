import { JsonProperty } from '@app/utilities';
import {
  ServiceType,
  ServiceTypeSerialization
} from '../enumerations/service-type.enum';
import { McsEntityBase } from '../common/mcs-entity.base';

export class McsServerOperatingSystem extends McsEntityBase {
  @JsonProperty()
  public name: string = undefined;

  @JsonProperty()
  public type: string = undefined;

  @JsonProperty()
  public architecture: string = undefined;

  @JsonProperty({
    serializer: ServiceTypeSerialization,
    deserializer: ServiceTypeSerialization
  })
  public serviceType: ServiceType = undefined;

  @JsonProperty()
  public vendor: string = undefined;

  @JsonProperty()
  public billingCode: string = undefined;

  @JsonProperty()
  public kickstartRequired: boolean = undefined;

  @JsonProperty()
  public kickstartAvailable: boolean = undefined;

  @JsonProperty()
  public minimumMemoryMB: number = undefined;

  @JsonProperty()
  public minimumCpu: number = undefined;
}
