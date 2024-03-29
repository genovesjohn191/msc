import { JsonProperty } from '@app/utilities';
import { McsEntityBase } from '../common/mcs-entity.base';
import { McsDateSerialization } from '../serialization/mcs-date-serialization';

export class McsServerSnapshot extends McsEntityBase {
  @JsonProperty()
  public sizeMB: number = undefined;

  @JsonProperty()
  public poweredOn: boolean = undefined;

  @JsonProperty()
  public includesMemory: boolean = undefined;

  @JsonProperty({
    serializer: McsDateSerialization,
    deserializer: McsDateSerialization
  })
  public createdOn: Date = undefined;
}
