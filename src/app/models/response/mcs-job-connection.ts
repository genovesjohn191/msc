import { JsonProperty } from 'json-object-mapper';
import { McsDateSerialization } from '../serialization/mcs-date-serialization';

export class McsJobConnection {
  public host: string;
  public destinationKey: string;
  public destinationRoute: string;

  @JsonProperty({
    type: Date,
    serializer: McsDateSerialization,
    deserializer: McsDateSerialization
  })
  public expiry: Date;

  constructor() {
    this.host = undefined;
    this.destinationKey = undefined;
    this.destinationRoute = undefined;
    this.expiry = undefined;
  }
}
