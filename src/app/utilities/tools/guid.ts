import { isNullOrEmpty } from '@app/utilities';

const GUID_EMPTY = '00000000-0000-0000-0000-000000000000';
const GUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class Guid {
  /**
   * GUID Validator based on regex pattern
   */
  public static validator = new RegExp(GUID_PATTERN);

  /**
   * Generates new guid and return the whole Guid class
   */
  public static newGuid(): Guid {
    let pattern = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
    let currentDateStamp = new Date().getTime();
    if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
      currentDateStamp += performance.now(); // use high-precision timer if available
    }
    let generatedGuid = pattern.replace(/[xy]/g, (value: any) => {
      let randomValues = (currentDateStamp + Math.random() * 16) % 16 | 0;
      currentDateStamp = Math.floor(currentDateStamp / 16);
      return (value === 'x' ? randomValues : (randomValues & 0x3 | 0x8)).toString(16);
    });
    return new Guid(generatedGuid);
  }

  /**
   * Returns true when the inputted parameter is GUID
   */
  public static isGuid(value: string | Guid): boolean {
    if (isNullOrEmpty(value)) { return false; }
    return (value instanceof Guid) ?
      true : Guid.validator.test(value);
  }
  private _value: string;

  constructor(guidString?: string) {
    this._value = GUID_EMPTY;
    if (Guid.isGuid(guidString)) { this._value = guidString; }
  }

  /**
   * Returns true when the inputted guid is the same as the instance
   * @param other Other guid to be checked
   */
  public equals(other: Guid): boolean {
    return Guid.isGuid(other) && this._value === other.toString();
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
