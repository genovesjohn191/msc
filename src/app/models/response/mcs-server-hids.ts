import { JsonProperty } from '@peerlancers/json-serialization';
import {
  HidsStatusSerialization,
  HidsStatus
} from '../enumerations/hids-status.enum';

export class McsServerHids {
  @JsonProperty()
  public count: number = undefined;

  @JsonProperty({
    serializer: HidsStatusSerialization,
    deserializer: HidsStatusSerialization
  })
  public status: HidsStatus = HidsStatus.Inactive;
}

