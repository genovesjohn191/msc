export class BillingServiceItem {

  constructor(
    public service: string,
    public finalChargeDollars: number,
    public hasMetMinimumCommitment: boolean,
    public minimumSpendCommitment: number,
    public managementCharges: number,
    public tenantName: string,
    public initialDomain: string,
    public primaryDomain: string,
    public microsoftIdentifier: string,
    public billingDescription: string,
    public microsoftChargeMonth: string,
    public macquarieBillMonth: string
  ) { }
}
