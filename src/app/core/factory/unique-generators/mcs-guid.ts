import { isNullOrEmpty } from '@app/utilities';

const GUID_EMPTY = '00000000-0000-0000-0000-000000000000';
const GUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const GUID_CRYPTO = window.crypto || (window as any).msCrypto;

export class McsGuid {
  /**
   * GUID Validator based on regex pattern
   */
  public static validator = new RegExp(GUID_PATTERN);

  /**
   * Generates new guid and return the whole McsGuid class
   */
  public static newGuid(): McsGuid {
    let pattern = ([1e7] as any + -1e3 + -4e3 + -8e3 + -1e11);
    let generatedGuid = pattern.replace(/[018]/g, (value: any) =>
      // tslint:disable-next-line:no-bitwise
      (value ^ GUID_CRYPTO.getRandomValues(new Uint8Array(1))[0] & 15 >> value / 4).toString(16)
    );
    return new McsGuid(generatedGuid);
  }

  /**
   * Returns true when the inputted parameter is GUID
   */
  public static isGuid(value: string | McsGuid): boolean {
    if (isNullOrEmpty(value)) { return false; }
    return (value instanceof McsGuid) ?
      true : McsGuid.validator.test(value);
  }
  private _value: string;

  constructor(guidString?: string) {
    this._value = GUID_EMPTY;
    if (McsGuid.isGuid(guidString)) { this._value = guidString; }
  }

  /**
   * Returns true when the inputted guid is the same as the instance
   * @param other Other guid to be checked
   */
  public equals(other: McsGuid): boolean {
    return McsGuid.isGuid(other) && this._value === other.toString();
  }

  /**
   * Returns true when the current instance of guid is empty
   */
  public isEmpty(): boolean {
    return this._value === GUID_EMPTY;
  }

  /**
   * Returns the string representation of the GUID
   */
  public toString(): string {
    return this._value;
  }
}
