import { JsonProperty } from '@app/utilities';
import { McsDateSerialization } from '../serialization/mcs-date-serialization';

export class McsAzureResourceTag {

  @JsonProperty()
  public id: string = undefined;

  @JsonProperty()
  public name: string = undefined;

  @JsonProperty()
  public value: string = undefined;

  @JsonProperty()
  public active: boolean = undefined;

  @JsonProperty({
    serializer: McsDateSerialization,
    deserializer: McsDateSerialization
  })
  public createdOn: Date = undefined;

  @JsonProperty({
    serializer: McsDateSerialization,
    deserializer: McsDateSerialization
  })
  public updatedOn: Date = undefined;
}
