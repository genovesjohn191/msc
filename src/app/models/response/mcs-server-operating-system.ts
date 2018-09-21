import { JsonProperty } from 'json-object-mapper';
import {
  ServiceType,
  ServiceTypeSerialization
} from '../enumerations/service-type.enum';
import { McsEntityBase } from '../mcs-entity.base';

export class McsServerOperatingSystem extends McsEntityBase {
  public name: string;

  @JsonProperty({
    type: ServiceType,
    serializer: ServiceTypeSerialization,
    deserializer: ServiceTypeSerialization
  })
  public serviceType: ServiceType;

  constructor() {
    super();
    this.name = undefined;
    this.serviceType = undefined;
  }
}
