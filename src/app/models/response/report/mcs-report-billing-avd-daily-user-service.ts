import { JsonProperty } from '@app/utilities';

import { McsEntityBase } from '../../common/mcs-entity.base';
import { McsReportBillingServiceTenant } from '../mcs-report-billing-service-tenant';

export class McsReportBillingAvdDailyUserService extends McsEntityBase {
  @JsonProperty()
  public serviceId: string = undefined;

  @JsonProperty()
  public billingDescription: string = undefined;

  @JsonProperty()
  public billingAccountId: string = undefined;

  @JsonProperty()
  public azureDescription: string = undefined;

  @JsonProperty()
  public productType: string = undefined;

  @JsonProperty()
  public users: number = undefined;

  @JsonProperty()
  public connections: number = undefined;

  @JsonProperty()
  public plan: string = undefined;

  @JsonProperty({ target: McsReportBillingServiceTenant })
  public tenant: McsReportBillingServiceTenant = undefined;

  @JsonProperty()
  public microsoftId: string = undefined;
}
