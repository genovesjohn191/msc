import {
  ServerServiceType,
  ServerServiceTypeSerialization
} from '../enumerations/server-service-type.enum';
import { JsonProperty } from 'json-object-mapper';

export class ServerOperatingSystem {
  public name: string;

  @JsonProperty({
    type: ServerServiceType,
    serializer: ServerServiceTypeSerialization,
    deserializer: ServerServiceTypeSerialization
  })
  public serviceType: ServerServiceType;

  constructor() {
    this.name = undefined;
    this.serviceType = undefined;
  }
}
