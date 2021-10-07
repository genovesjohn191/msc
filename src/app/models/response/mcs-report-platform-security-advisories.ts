import { JsonProperty } from '@app/utilities';
import { McsEntityBase } from '../common/mcs-entity.base';

export class McsReportPlatformSecurityAdvisories extends McsEntityBase {

  @JsonProperty()
  public description: string = undefined;

  @JsonProperty()
  public impactedServices: string[] = undefined;

  @JsonProperty()
  public impactedRegions: string[] = undefined;

  @JsonProperty()
  public azureTrackingId: string = undefined;

  @JsonProperty()
  public startTime: Date = undefined;

  @JsonProperty()
  public link: string = undefined;
}
