import { JsonProperty } from '@app/utilities';
import { isNullOrUndefined } from '@app/utilities';

const DEFAULT_CURRENCY_SYMBOL = '$';

export class McsOrderCharge {
  @JsonProperty()
  public monthly: number = undefined;

  @JsonProperty()
  public oneOff: number = undefined;

  @JsonProperty()
  public excessUsageFeePerGB: number = undefined;

  /**
   * Returns the currency symbol as USD
   */
  public get currencySymbol(): string {
    // TODO: Need to be confirmed since the currency should depend on the country
    return DEFAULT_CURRENCY_SYMBOL;
  }

  /**
   * Returns the sum of monthly and oneoff total cost
   */
  public get monthlyInCurrency(): string {
    return this._chargeInCurreny(this.monthly);
  }

  /**
   * Returns the sum of monthly and oneoff total cost
   */
  public get oneOffInCurrency(): string {
    return this._chargeInCurreny(this.oneOff);
  }

  /**
   * Returns the sum of monthly and oneoff total cost
   */
  public get excessUsageFeePerGbInCurrency(): string {
    return this._chargeInCurreny(this.excessUsageFeePerGB);
  }

  /**
   * Returns the sum of monthly and oneoff total cost
   */
  public get totalCost(): number {
    return this.monthly + this.oneOff;
  }

  private _chargeInCurreny(fee: number): string {
    return isNullOrUndefined(fee) ? 'N/A' : `${DEFAULT_CURRENCY_SYMBOL}${fee}`;
  }
}
