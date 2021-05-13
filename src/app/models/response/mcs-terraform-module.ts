import { JsonProperty } from '@app/utilities';

import { McsEntityBase } from '../common/mcs-entity.base';
import { McsDateSerialization } from '../serialization/mcs-date-serialization';

export class McsTerraformModule extends McsEntityBase {

  @JsonProperty()
  public fullName: string = undefined;

  @JsonProperty()
  public name: string = undefined;

  @JsonProperty()
  public category: string = undefined;

  @JsonProperty()
  public categoryName: string = undefined;

  @JsonProperty()
  public slugId: string = undefined;

  @JsonProperty()
  public slug: string = undefined;

  @JsonProperty()
  public description: string = undefined;

  @JsonProperty()
  public projectKey: string = undefined;

  @JsonProperty()
  public tags: string[] = undefined;

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
