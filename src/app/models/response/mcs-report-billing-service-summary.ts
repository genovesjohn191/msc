import { JsonProperty } from '@app/utilities';

import { McsEntityBase } from '../common/mcs-entity.base';
import { McsReportBillingServiceTenant } from './mcs-report-billing-service-tenant';

export class McsReportBillingServiceSummary extends McsEntityBase {
  @JsonProperty()
  public active: boolean = undefined;

  @JsonProperty()
  public billingAccountId: string = undefined;

  @JsonProperty()
  public finalChargeDollars: number = undefined;

  @JsonProperty()
  public serviceId: string = undefined;

  @JsonProperty()
  public billingDescription: string = undefined;

  @JsonProperty()
  public productType: string = undefined;

  @JsonProperty()
  public azureDescription: string = undefined;

  @JsonProperty()
  public installedQuantity: number = undefined;

  @JsonProperty()
  public discountPercent: number = undefined;

  @JsonProperty({ target: McsReportBillingServiceTenant })
  public tenant: McsReportBillingServiceTenant = undefined;

  @JsonProperty()
  public microsoftId: string = undefined;

  @JsonProperty()
  public macquarieBillMonth: string = undefined;

  @JsonProperty()
  public microsoftChargeMonth: string = undefined;

  @JsonProperty()
  public isProjection: boolean = undefined;

  @JsonProperty()
  public markupPercent: number = undefined;

  @JsonProperty()
  public hasMetMinimumCommitment: boolean = undefined;

  @JsonProperty()
  public minimumCommitmentDollars: number = undefined;

  @JsonProperty()
  public userQuantity: number = undefined;

  @JsonProperty()
  public chargePerUserDollars: number = undefined;

  @JsonProperty()
  public plan: string = undefined;

  @JsonProperty()
  public linkedConsumptionService: string = undefined;
}
