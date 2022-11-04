import { JsonProperty } from '@app/utilities';

import { McsQueryParam } from '../../common/mcs-query-param';

export class McsReportBillingAvdDailyAverageUsersParam extends McsQueryParam {
  @JsonProperty({ name: 'id' })
  public id: string = undefined;

  @JsonProperty({ name: 'service_id' })
  public serviceId: string = undefined;

  @JsonProperty({ name: 'billing_description' })
  public billingDescription: string = undefined;

  @JsonProperty({ name: 'azure_description' })
  public azureDescription: string = undefined;

  @JsonProperty({ name: 'product_type' })
  public productType: string = undefined;

  @JsonProperty({ name: 'microsoft_charge_month_range_after' })
  public microsoftChargeMonthRangeAfter: string = undefined;

  @JsonProperty({ name: 'microsoft_charge_month_range_before' })
  public microsoftChargeMonthRangeBefore: string = undefined;

  @JsonProperty({ name: 'tenant_id' })
  public tenantId: string = undefined;

  @JsonProperty({ name: 'billing_account_id' })
  public billingAccountId: string = undefined;

  @JsonProperty({ name: 'date' })
  public date: string = undefined;
}
