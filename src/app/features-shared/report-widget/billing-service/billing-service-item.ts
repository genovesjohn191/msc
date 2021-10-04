export class BillingServiceItem {
  public productType: string;
  public service: string;
  public microsoftChargeMonth: string;
  public macquarieBillMonth: string;
  public azureDescription: string;
  public isProjection: boolean;
  public finalChargeDollars: number;
  public installedQuantity: number;
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


  // public get azureDescription(): string {
  //   return this._getFieldValue('azureDescription') ||
  //     this._getFieldValue('billingDescription');
  // }

  // public get productType(): string {
  //   return this._getFieldValue('productType');
  // }

  // public get isProjection(): boolean {
  //   return this._getFieldValue('isProjection');
  // }

  // public get finalChargeDollars(): number {
  //   return this._getFieldValue('finalChargeDollars');
  // }

  // public get installedQuantity(): number {
  //   return this._getFieldValue('installedQuantity');
  // }

  // public get discountPercent(): number {
  //   return this._getFieldValue('discountPercent');
  // }

  // public get hasMetMinimumCommitment(): boolean {
  //   return this._getFieldValue('hasMetMinimumCommitment');
  // }

  // public get minimumCommitmentDollars(): number {
  //   return this._getFieldValue('minimumCommitmentDollars');
  // }

  // public get markupPercent(): number {
  //   return this._getFieldValue('markupPercent');
  // }

  // public get markupPercentParent(): number {
  //   return this.parentService?.markupPercent;
  // }

  // public get microsoftIdentifier(): string {
  //   return this._getFieldValue('microsoftId');
  // }

  // public get billingDescription(): string {
  //   return this._getFieldValue('billingDescription');
  // }

  // public get linkManagementService(): string {
  //   return this.parentService?.serviceId;
  // }

  // public get tenantName(): string {
  //   return this.childService?.tenant?.name ||
  //     this.parentService?.tenant?.name;
  // }

  // public get initialDomain(): string {
  //   return this.childService?.tenant?.initialDomain ||
  //     this.parentService?.tenant?.initialDomain;
  // }

  // public get primaryDomain(): string {
  //   return this.childService?.tenant?.primaryDomain ||
  //     this.parentService?.tenant?.primaryDomain;
  // }
}
