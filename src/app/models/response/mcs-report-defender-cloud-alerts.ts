import { JsonProperty } from '@app/utilities';
import { McsEntityBase } from '../common/mcs-entity.base';

export class McsReportDefenderCloudAlerts extends McsEntityBase {
  @JsonProperty()
  public severity: string = undefined;

  @JsonProperty()
  public title: string = undefined;

  @JsonProperty()
  public description: string = undefined;

  @JsonProperty()
  public affectedResource: string = undefined;

  @JsonProperty()
  public status: string = undefined;

  @JsonProperty()
  public startTime: Date = undefined;
}