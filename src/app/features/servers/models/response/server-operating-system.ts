import { JsonProperty } from 'json-object-mapper';
import { McsEntityBase } from '../../../../core';
import {
  ServerServiceType,
  ServerServiceTypeSerialization
} from '../enumerations/server-service-type.enum';

export class ServerOperatingSystem extends McsEntityBase {
  public name: string;

  @JsonProperty({
    type: ServerServiceType,
    serializer: ServerServiceTypeSerialization,
    deserializer: ServerServiceTypeSerialization
  })
  public serviceType: ServerServiceType;

  constructor() {
    super();
    this.name = undefined;
    this.serviceType = undefined;
  }
}
