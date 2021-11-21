export class BillingSummaryItem {
  public id: string;
  public productType: string;
  public isProjection: boolean;
  public microsoftChargeMonth: string;
  public macquarieBillMonth: string;
  public finalChargeDollars: number;
  public usdPerUnit: number;
  public sortDate: Date;
  public timestamp?: number;
}
