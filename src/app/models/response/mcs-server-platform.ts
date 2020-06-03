import { JsonProperty } from '@app/utilities';
import {
  PlatformType,
  PlatformTypeSerialization
} from '../enumerations/platform-type.enum';

export class McsServerPlatform {
  @JsonProperty()
  public resourceId: string = undefined;

  @JsonProperty()
  public resourceName: string = undefined;

  @JsonProperty()
  public environmentName: string = undefined;

  @JsonProperty({
    serializer: PlatformTypeSerialization,
    deserializer: PlatformTypeSerialization
  })
  public type: PlatformType = undefined;
}
