import { JsonProperty } from '@app/utilities';

import { McsQueryParam } from './mcs-query-param';

export class McsReportBillingSummaryParams extends McsQueryParam {
  @JsonProperty({ name: 'id' })
  public id: string = undefined;

  @JsonProperty({ name: 'name' })
  public name: string = undefined;

  @JsonProperty({ name: 'active' })
  public active: boolean = undefined;

  @JsonProperty({ name: 'gst_exclusive_charge_dollars' })
  public gstExclusiveChargeDollars: number = undefined;

  @JsonProperty({ name: 'has_met_minimum_commitment' })
  public hasMetMininumCommitment: boolean = undefined;

  @JsonProperty({ name: 'service_id' })
  public serviceId: string = undefined;

  @JsonProperty({ name: 'billing_description' })
  public billingDescription: string = undefined;

  @JsonProperty({ name: 'azure_description' })
  public azureDescription: string = undefined;

  @JsonProperty({ name: 'product_type' })
  public productType: string = undefined;

  @JsonProperty({ name: 'minimum_commitment_dollars' })
  public minmumCommitmentDollars: number = undefined;

  @JsonProperty({ name: 'markup_percent' })
  public markupPercent: number = undefined;

  @JsonProperty({ name: 'discount_percent' })
  public discountPercent: number = undefined;

  @JsonProperty({ name: 'macquarie_bill_month' })
  public macquarieBillMonth: string = undefined;

  @JsonProperty({ name: 'macquarie_bill_month_range' })
  public macquarieBillMonthRange: string = undefined;

  @JsonProperty({ name: 'microsoft_charge_month' })
  public microsoftChargeMonth: string = undefined;

  @JsonProperty({ name: 'microsoft_charge_month_range' })
  public microsoftChargeMonthRange: string = undefined;

  @JsonProperty({ name: 'microsoft_charge_month_range_after' })
  public microsoftChargeMonthRangeAfter: string = undefined;

  @JsonProperty({ name: 'microsoft_charge_month_range_before' })
  public microsoftChargeMonthRangeBefore: string = undefined;

  @JsonProperty({ name: 'tenant_id' })
  public tenantId: string = undefined;

  @JsonProperty({ name: 'billing_account_id' })
  public billingAccountId: string = undefined;

  @JsonProperty({ name: 'is_projection' })
  public isProjection: boolean = undefined;
}
