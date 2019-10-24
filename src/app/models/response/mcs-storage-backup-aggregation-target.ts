import { JsonProperty } from '@peerlancers/json-serialization';
import { McsEntityBase } from '../common/mcs-entity.base';
import { InviewLevel } from '../enumerations/inview-level.enum';
import { McsDateSerialization } from '../serialization/mcs-date-serialization';


export class McsStorageBackUpAggregationTarget extends McsEntityBase {
  @JsonProperty()
  public serviceId: string = undefined;

  @JsonProperty()
  public description: string = undefined;

  @JsonProperty({
    serializer: McsDateSerialization,
    deserializer: McsDateSerialization
  })
  public inviewLevel: InviewLevel = undefined;

  @JsonProperty()
  public retentionPeriod: string = undefined;
}
