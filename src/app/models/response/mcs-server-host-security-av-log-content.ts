import { JsonProperty } from '@peerlancers/json-serialization';
import { McsDateSerialization } from '../serialization/mcs-date-serialization';
import {
  AntiVirusSeveritySerialization,
  AntiVirusSeverity
} from '../enumerations/anti-virus-severity.enum';

export class McsServerHostSecurityAvLogContent {

  @JsonProperty()
  public description: string = undefined;

  @JsonProperty({
    serializer: McsDateSerialization,
    deserializer: McsDateSerialization
  })
  public detectedOn: Date = undefined;

  @JsonProperty()
  public path: string = undefined;

  @JsonProperty()
  public scanType: string = undefined;

  @JsonProperty()
  public actionTaken: string = undefined;

  @JsonProperty({
    serializer: AntiVirusSeveritySerialization,
    deserializer: AntiVirusSeveritySerialization
  })
  public severity: AntiVirusSeverity = undefined;
}
