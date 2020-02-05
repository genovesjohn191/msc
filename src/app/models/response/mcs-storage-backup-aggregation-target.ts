import { JsonProperty } from '@peerlancers/json-serialization';
import { McsEntityBase } from '../common/mcs-entity.base';
import {
  InviewLevel,
  InviewLevelSerialization
} from '../enumerations/inview-level.enum';

export class McsStorageBackUpAggregationTarget extends McsEntityBase {
  @JsonProperty()
  public serviceId: string = undefined;

  @JsonProperty()
  public description: string = undefined;

  @JsonProperty({
    serializer: InviewLevelSerialization,
    deserializer: InviewLevelSerialization
  })
  public inviewLevel: InviewLevel = undefined;

  @JsonProperty()
  public retentionPeriod: string = undefined;
}
