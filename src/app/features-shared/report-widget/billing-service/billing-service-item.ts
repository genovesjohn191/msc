export class BillingServiceItem {
  public id: string;
  public productType: string;
  public serviceId: string;
  public microsoftChargeMonth: string;
  public macquarieBillMonth: string;
  public azureDescription: string;
  public isProjection: boolean;
  public finalChargeDollars: number;
  public installedQuantity: number;
  public usdPerUnit: number;
  public discountPercent: number;
  public hasMetMinimumCommitment: boolean;
  public minimumCommitmentDollars: number;
  public markupPercent: number;
  public microsoftIdentifier: string;
  public billingDescription: string;
  public tenantName: string;
  public initialDomain: string;
  public primaryDomain: string;

  public sortDate?: Date;
  public timestamp?: number;

  public parentServiceId?: string;
  public markupPercentParent?: number;
}
