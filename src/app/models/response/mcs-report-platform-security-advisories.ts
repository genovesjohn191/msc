import { JsonProperty } from '@app/utilities';
import { McsEntityBase } from '../common/mcs-entity.base';
import { McsDateSerialization } from '../serialization/mcs-date-serialization';

export class McsReportPlatformSecurityAdvisories extends McsEntityBase {

  @JsonProperty()
  public description: string = undefined;

  @JsonProperty()
  public impactedServices: string[] = undefined;

  @JsonProperty()
  public impactedRegions: string[] = undefined;

  @JsonProperty()
  public azureTrackingId: string = undefined;

  @JsonProperty({
    serializer: McsDateSerialization,
    deserializer: McsDateSerialization
  })
  public startTime: Date = undefined;
}
