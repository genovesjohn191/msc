import { JsonProperty } from '@app/utilities';

import { McsReportBillingService } from './mcs-report-billing-service';

export class McsReportBillingServiceGroup {
  @JsonProperty()
  public macquarieBillMonth: string = undefined;

  @JsonProperty()
  public microsoftChargeMonth: string = undefined;

  @JsonProperty()
  public isProjection: boolean = undefined;

  @JsonProperty({ target: McsReportBillingService })
  public parentServices: McsReportBillingService[] = undefined;
}
