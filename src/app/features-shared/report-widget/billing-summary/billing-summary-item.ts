export class BillingSummaryItem {

  constructor(
    public productType: string,
    public microsoftChargeMonth: string,
    public macquarieBillMonth: string,
    public finalChargeDollars: number,
    public sortDate: Date,
    public data?: any
  ) { }
}
