import {
  McsReportBillingService,
  McsReportBillingServiceSummary
} from '@app/models';
import { isNullOrEmpty } from '@app/utilities';

export class BillingServiceItem {

  constructor(
    public service: string,
    public microsoftChargeMonth: string,
    public macquarieBillMonth: string,
    public sortDate: Date,
    public parentService: McsReportBillingService,
    public childService?: McsReportBillingServiceSummary
  ) { }

  public get productType(): string {
    return this._getFieldValue('productType');
  }

  public get isProjection(): boolean {
    return this._getFieldValue('isProjection');
  }

  public get finalChargeDollars(): number {
    return this._getFieldValue('finalChargeDollars');
  }

  public get discountPercent(): number {
    return this._getFieldValue('discountPercent');
  }

  public get hasMetMinimumCommitment(): boolean {
    return this._getFieldValue('hasMetMinimumCommitment');
  }

  public get minimumCommitmentDollars(): number {
    return this._getFieldValue('minimumCommitmentDollars');
  }

  public get markupPercent(): number {
    return this._getFieldValue('markupPercent');
  }

  public get tenantName(): string {
    return this.childService?.tenant?.name ||
      this.parentService?.tenant?.name;
  }

  public get initialDomain(): string {
    return this.childService?.tenant?.initialDomain ||
      this.parentService?.tenant?.initialDomain;
  }

  public get primaryDomain(): string {
    return this.childService?.tenant?.primaryDomain ||
      this.parentService?.tenant?.primaryDomain;
  }

  public get microsoftIdentifier(): string {
    return this._getFieldValue('microsoftId');
  }

  public get billingDescription(): string {
    return this._getFieldValue('billingDescription');
  }

  public get linkManagementService(): string {
    return this.parentService?.serviceId;
  }

  private _getFieldValue<TValue, TProperty extends keyof (McsReportBillingService | McsReportBillingServiceSummary)>(
    property: TProperty
  ): TValue {
    if (!isNullOrEmpty(this.childService)) {
      return this.childService[property] as any;
    }
    return this.parentService[property] as any;
  }
}
