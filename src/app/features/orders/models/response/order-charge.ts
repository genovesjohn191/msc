export class OrderCharge {
  public monthly: number;
  public oneOff: number;
  public upFront: number;

  constructor() {
    this.monthly = undefined;
    this.oneOff = undefined;
    this.upFront = undefined;
  }

  /**
   * Returns the currency symbol as USD
   */
  public get currencySymbol(): string {
    // TODO: Need to be confirmed since the currency should depend on the country
    return '$';
  }
}
