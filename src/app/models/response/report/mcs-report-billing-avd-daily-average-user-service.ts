import { JsonProperty } from '@app/utilities';

import { McsEntityBase } from '../../common/mcs-entity.base';
import { McsReportBillingServiceTenant } from '../mcs-report-billing-service-tenant';

export class McsReportBillingAvdDailyAverageUserService extends McsEntityBase {
  @JsonProperty()
  public serviceId: string = undefined;

  @JsonProperty()
  public billingDescription: string = undefined;

  @JsonProperty()
  public azureDescription: string = undefined;

  @JsonProperty()
  public productType: string = undefined;

  @JsonProperty()
  public averageUsers: number = undefined;

  @JsonProperty()
  public averageConnections: number = undefined;

  @JsonProperty()
  public minimumCommitmentUsers: number = undefined;

  @JsonProperty()
  public plan: string = undefined;

  @JsonProperty({ target: McsReportBillingServiceTenant })
  public tenant: McsReportBillingServiceTenant = undefined;
}

