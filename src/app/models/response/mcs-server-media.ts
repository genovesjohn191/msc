import { JsonProperty } from '@app/utilities';
import { McsEntityBase } from '../common/mcs-entity.base';
import { McsDateSerialization } from '../serialization/mcs-date-serialization';

export class McsServerMedia extends McsEntityBase {
  @JsonProperty()
  public name: string = undefined;

  @JsonProperty()
  public resourceId: string = undefined;

  @JsonProperty()
  public resourceName: string = undefined;

  @JsonProperty()
  public catalogName: string = undefined;

  @JsonProperty()
  public sizeMB: number = undefined;

  @JsonProperty({
    serializer: McsDateSerialization,
    deserializer: McsDateSerialization
  })
  public createdOn: Date = undefined;
}
