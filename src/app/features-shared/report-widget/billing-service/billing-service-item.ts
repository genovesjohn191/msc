export class BillingServiceItem {

  constructor(
    public name: string,
    public chargeMonth: string,
    public finalChargeDollars: number,
    public data?: any
  ) { }
}
