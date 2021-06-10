import { JsonProperty } from '@app/utilities';
import { McsDateSerialization } from '../serialization/mcs-date-serialization';

export class McsNetworkDbUseCase {
  @JsonProperty()
  public id: number = undefined;

  @JsonProperty()
  public name: string = undefined;

  @JsonProperty()
  public description: string = undefined;

  @JsonProperty()
  public createdBy: string = undefined;

  @JsonProperty({
    serializer: McsDateSerialization,
    deserializer: McsDateSerialization
  })
  public createdOn: Date = undefined;

  @JsonProperty()
  public updatedBy: string = undefined;

  @JsonProperty({
    serializer: McsDateSerialization,
    deserializer: McsDateSerialization
  })
  public updatedOn: Date = undefined;
}
