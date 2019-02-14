export class McsOrderCharge {
  public monthly: number;
  public oneOff: number;

  constructor() {
    this.monthly = undefined;
    this.oneOff = undefined;
  }

  /**
   * Returns the currency symbol as USD
   */
  public get currencySymbol(): string {
    // TODO: Need to be confirmed since the currency should depend on the country
    return '$';
  }
}
