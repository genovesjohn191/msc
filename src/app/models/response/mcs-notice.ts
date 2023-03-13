import { JsonProperty } from '@app/utilities';

import { McsEntityBase } from '../common/mcs-entity.base';
import { McsDateSerialization } from '../serialization/mcs-date-serialization';

export class McsNotice extends McsEntityBase {
  @JsonProperty()
  public parentReferenceId: string = undefined;

  @JsonProperty()
  public referenceId: string = undefined;

  @JsonProperty()
  public acknowledged: boolean = undefined;

  @JsonProperty()
  public summary: string = undefined;

  @JsonProperty()
  public description: string = undefined;

  @JsonProperty()
  public htmlDescription: string = undefined;

  @JsonProperty({
    serializer: McsDateSerialization,
    deserializer: McsDateSerialization
  })
  @JsonProperty()
  public createdOn: Date = undefined;
}
