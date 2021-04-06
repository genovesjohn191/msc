import { JsonProperty } from '@app/utilities';
import { McsEntityBase } from '../common/mcs-entity.base';
import { McsDateSerialization } from '../serialization/mcs-date-serialization';

export class McsAvailabilityZone extends McsEntityBase {

  @JsonProperty()
  public name: string = undefined;

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

  @JsonProperty()
  public active: Date = undefined;
}
