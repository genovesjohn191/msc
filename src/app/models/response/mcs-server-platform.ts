import {
  PlatformType,
  PlatformTypeSerialization
} from '../enumerations/platform-type.enum';
import { JsonProperty } from 'json-object-mapper';

export class McsServerPlatform {
  public resourceId: string;
  public resourceName: string;
  public environmentName: string;

  @JsonProperty({
    type: PlatformType,
    serializer: PlatformTypeSerialization,
    deserializer: PlatformTypeSerialization
  })
  public type: PlatformType;

  constructor() {
    this.type = undefined;
    this.resourceId = undefined;
    this.resourceName = undefined;
    this.environmentName = undefined;
  }
}
