import { JsonProperty } from '@app/utilities';
import {
  HidsProtectionLevel,
  HidsProtectionLevelSerialization
} from '../enumerations/hids-protection-level.enum';


export class McsOrderServerHidsAdd {
  @JsonProperty({
    serializer: HidsProtectionLevelSerialization,
    deserializer: HidsProtectionLevelSerialization
  })
  public protectionLevel: HidsProtectionLevel = undefined;
}
