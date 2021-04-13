import { JsonProperty } from '@app/utilities';
import { McsEntityBase } from '../common/mcs-entity.base';
import { McsDateSerialization } from '../serialization/mcs-date-serialization';

export class McsTerraformDeployment extends McsEntityBase {

  @JsonProperty()
  public name: string = undefined;

  @JsonProperty()
  public slugId: string = undefined;

  @JsonProperty()
  public tfvars: string = undefined;

  @JsonProperty()
  public tag: string = undefined;

  @JsonProperty({
    serializer: McsDateSerialization,
    deserializer: McsDateSerialization
  })
  public createdOn: Date = undefined;

  @JsonProperty()
  public createdBy: string = undefined;

  @JsonProperty({
    serializer: McsDateSerialization,
    deserializer: McsDateSerialization
  })
  public updatedOn: Date = undefined;
}
