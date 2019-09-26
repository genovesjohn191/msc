import { JsonProperty } from '@peerlancers/json-serialization';

export class McsOrderCharge {
  @JsonProperty()
  public monthly: number = undefined;

  @JsonProperty()
  public oneOff: number = undefined;

  /**
   * Returns the currency symbol as USD
   */
  public get currencySymbol(): string {
    // TODO: Need to be confirmed since the currency should depend on the country
    return '$';
  }

  /**
   * Returns the sum of monthly and oneoff total cost
   */
  public get totalCost(): number {
    return this.monthly + this.oneOff;
  }
}
