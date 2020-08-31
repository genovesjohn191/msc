import { JsonProperty } from '@app/utilities';
import {
  transformNumberToDecimal,
  isNullOrUndefined
 } from '@app/utilities';

const DEFAULT_CURRENCY_SYMBOL = '$';

export class McsOrderCharge {
  @JsonProperty()
  public monthly: number = undefined;

  @JsonProperty()
  public oneOff: number = undefined;

  @JsonProperty()
  public excessUsageFeePerGB: number = undefined;

  @JsonProperty()
  public hourly: number = undefined;

  /**
   * Returns the currency symbol as USD
   */
  public get currencySymbol(): string {
    return DEFAULT_CURRENCY_SYMBOL;
  }

  /**
   * Returns the monthly fee with currency
   */
  public get monthlyInCurrency(): string {
    return this._chargeInCurreny(this.monthly);
  }

  /**
   * Returns the one off fee with currency
   */
  public get oneOffInCurrency(): string {
    return this._chargeInCurreny(this.oneOff);
  }

  /**
   * Returns the excess usage per gb fee with currency
   */
  public get excessUsageFeePerGbInCurrency(): string {
    return this._chargeInCurreny(this.excessUsageFeePerGB);
  }

  /**
   * Returns the hourly fee with currency
   */
  public get hourlyInCurrency(): string {
    return this._chargeInCurreny(this.hourly);
  }

  /**
   * Returns the sum of monthly and oneoff total cost
   */
  public get totalCost(): number {
    return this.monthly + this.oneOff;
  }

  private _chargeInCurreny(fee: number): string {
    return isNullOrUndefined(fee) ? 'N/A' : `${DEFAULT_CURRENCY_SYMBOL}${transformNumberToDecimal(fee, 2)}`;
  }
}
