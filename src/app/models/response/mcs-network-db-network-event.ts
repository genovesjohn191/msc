import { JsonProperty } from '@app/utilities';
import { McsDateSerialization } from '../serialization/mcs-date-serialization';

export class McsNetworkDbNetworkEvent {
  @JsonProperty({
    serializer: McsDateSerialization,
    deserializer: McsDateSerialization
  })
  public date: Date = undefined;

  @JsonProperty()
  public user : string = undefined;

  @JsonProperty()
  public action: string = undefined;

  @JsonProperty()
  public site: string = undefined;

  @JsonProperty()
  public pod: string = undefined;

  @JsonProperty()
  public vlanNumber: string = undefined;

}