import { JsonProperty } from '@app/utilities';

import { McsEntityBase } from '../common/mcs-entity.base';
import { McsReportBillingService } from './mcs-report-billing-service';

export class McsReportBillingServiceGroup extends McsEntityBase {
  @JsonProperty()
  public macquarieBillMonth: string = undefined;

  @JsonProperty()
  public microsoftChargeMonth: string = undefined;

  @JsonProperty()
  public isProjection: boolean = undefined;

  @JsonProperty()
  public usdPerUnit: number = undefined

  @JsonProperty({ target: McsReportBillingService })
  public parentServices: McsReportBillingService[] = undefined;
}
