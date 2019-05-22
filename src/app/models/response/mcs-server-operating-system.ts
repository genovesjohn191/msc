import { JsonProperty } from 'json-object-mapper';
import {
  ServiceType,
  ServiceTypeSerialization
} from '../enumerations/service-type.enum';
import { McsEntityBase } from '../common/mcs-entity.base';

export class McsServerOperatingSystem extends McsEntityBase {
  public name: string = undefined;
  public type: string = undefined;
  public architecture: string = undefined;

  @JsonProperty({
    type: ServiceType,
    serializer: ServiceTypeSerialization,
    deserializer: ServiceTypeSerialization
  })
  public serviceType: ServiceType = undefined;
  public vendor: string = undefined;
}
