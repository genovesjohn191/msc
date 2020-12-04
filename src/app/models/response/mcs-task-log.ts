import { JsonProperty } from '@app/utilities';
import { McsDateSerialization } from '../serialization/mcs-date-serialization';

export class McsTaskLog {
  @JsonProperty()
  public logType: string = undefined;

  @JsonProperty()
  public message: string = undefined;

  @JsonProperty({
    serializer: McsDateSerialization,
    deserializer: McsDateSerialization
  })
  public loggedOn: Date = undefined;
}
