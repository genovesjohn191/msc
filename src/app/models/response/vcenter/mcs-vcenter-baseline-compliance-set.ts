import { JsonProperty } from '@app/utilities';

import { McsEntityBase } from '../../common/mcs-entity.base';
import { McsDateSerialization } from '../../serialization/mcs-date-serialization';

export class McsVCenterBaselineComplianceSet extends McsEntityBase {
  @JsonProperty()
  public status: string = undefined;

  @JsonProperty({
    serializer: McsDateSerialization,
    deserializer: McsDateSerialization
  })
  public scanDate: Date = undefined;

  @JsonProperty()
  public host: string = undefined;

  @JsonProperty()
  public baseline: string = undefined;
}

