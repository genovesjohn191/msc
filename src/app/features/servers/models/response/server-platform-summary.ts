import {
  ServerPlatformType,
  ServerPlatformTypeSerialization
} from '../enumerations/server-platform-type.enum';
import { JsonProperty } from 'json-object-mapper';

export class ServerPlatformSummary {
  public resourceId: string;
  public resourceName: string;
  public environmentName: string;

  @JsonProperty({
    type: ServerPlatformType,
    serializer: ServerPlatformTypeSerialization,
    deserializer: ServerPlatformTypeSerialization
  })
  public type: ServerPlatformType;

  constructor() {
    this.type = undefined;
    this.resourceId = undefined;
    this.resourceName = undefined;
    this.environmentName = undefined;
  }
}
