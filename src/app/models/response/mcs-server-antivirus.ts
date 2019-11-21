import { JsonProperty } from '@peerlancers/json-serialization';
import {
  AntiVirusStatus,
  AntiVirusStatusSerialization
} from '../enumerations/anti-virus-status.enum';

export class McsServerAntiVirus {
  @JsonProperty()
  public count: number = undefined;

  @JsonProperty({
    serializer: AntiVirusStatusSerialization,
    deserializer: AntiVirusStatusSerialization
  })
  public status: AntiVirusStatus = AntiVirusStatus.Inactive;
}

