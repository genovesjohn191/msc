import { JsonProperty } from '@peerlancers/json-serialization';
import { McsDateSerialization } from '../serialization/mcs-date-serialization';
import {
  HostSecuritySeveritySerialization,
  HostSecuritySeverity
} from '../enumerations/host-security-severity.enum';

export class McsServerHostSecurityHidsLog {
  @JsonProperty()
  public description: string = undefined;

  @JsonProperty({
    serializer: McsDateSerialization,
    deserializer: McsDateSerialization
  })
  public detectedOn: Date = undefined;

  @JsonProperty()
  public applicationType: string = undefined;

  @JsonProperty()
  public interface: string = undefined;

  @JsonProperty()
  public sourceIpAddress: string = undefined;

  @JsonProperty()
  public destinationIpAddress: string = undefined;

  @JsonProperty()
  public actionTaken: string = undefined;

  @JsonProperty({
    serializer: HostSecuritySeveritySerialization,
    deserializer: HostSecuritySeveritySerialization
  })
  public severity: HostSecuritySeverity = undefined;
}
