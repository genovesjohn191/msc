import { JsonProperty } from '@peerlancers/json-serialization';
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
