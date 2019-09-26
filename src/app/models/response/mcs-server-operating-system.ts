import { JsonProperty } from '@peerlancers/json-serialization';
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
}
