import { JsonProperty } from '@app/utilities';
import { McsEntityBase } from '../common/mcs-entity.base';

export class McsReportRecentServiceRequestSlt extends McsEntityBase {

  @JsonProperty()
  public orderId: string = undefined;

  @JsonProperty()
  public description: string = undefined;

  @JsonProperty()
  public assignmentTarget: string = undefined;

  @JsonProperty()
  public submittedOn: Date = undefined;
}
