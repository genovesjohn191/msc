import { JsonProperty } from '@peerlancers/json-serialization';
import {
  InviewLevel,
  InviewLevelSerialization
} from '../enumerations/inview-level.enum';

export class McsServerCreateAddOnInview {
  @JsonProperty({
    serializer: InviewLevelSerialization,
    deserializer: InviewLevelSerialization
  })
  public inviewLevel: InviewLevel = undefined;
}
