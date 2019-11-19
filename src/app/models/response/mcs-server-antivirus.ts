import { JsonProperty } from '@peerlancers/json-serialization';
import {
  AntiVirusStatus,
  AntiVirusStatusSerialization
} from '../enumerations/antivirus-status.enum';

export class McsServerAntiVirus {
  @JsonProperty()
  public count: number = undefined;

  @JsonProperty({
    serializer: AntiVirusStatusSerialization,
    deserializer: AntiVirusStatusSerialization
  })
  public status: AntiVirusStatus = AntiVirusStatus.Inactive;
}

