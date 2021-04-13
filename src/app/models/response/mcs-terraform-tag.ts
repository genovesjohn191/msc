import { JsonProperty } from '@app/utilities';
import { McsEntityBase } from '../common/mcs-entity.base';
import { McsDateSerialization } from '../serialization/mcs-date-serialization';

export class McsTerraformTag extends McsEntityBase {

  @JsonProperty()
  public name: string = undefined;

  @JsonProperty()
  public message: string = undefined;

  @JsonProperty()
  public tfvars: string = undefined;

  @JsonProperty()
  public inputsPretty: string = undefined;

  @JsonProperty()
  public slugId: string = undefined;

  @JsonProperty()
  public module: string = undefined;

  @JsonProperty({
    serializer: McsDateSerialization,
    deserializer: McsDateSerialization
  })
  public date: Date = undefined;

}
