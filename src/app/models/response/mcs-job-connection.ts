import { JsonProperty } from '@peerlancers/json-serialization';
import { McsDateSerialization } from '../serialization/mcs-date-serialization';

export class McsJobConnection {
  @JsonProperty()
  public host: string = undefined;

  @JsonProperty()
  public destinationKey: string = undefined;

  @JsonProperty()
  public destinationRoute: string = undefined;

  @JsonProperty({
    serializer: McsDateSerialization,
    deserializer: McsDateSerialization
  })
  public expiry: Date = undefined;
}
