import { JsonProperty } from '@app/utilities';

import { McsReportBillingServiceSummary } from './mcs-report-billing-service-summary';

export class McsReportBillingService extends McsReportBillingServiceSummary {
  @JsonProperty()
  public macquarieBillMonth: string = undefined;

  @JsonProperty()
  public macquarieChargeMonth: string = undefined;

  @JsonProperty()
  public isProjection: boolean = undefined;

  @JsonProperty({ target: McsReportBillingServiceSummary })
  public childBillingServices: McsReportBillingServiceSummary[] = undefined;
}
