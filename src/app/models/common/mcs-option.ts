/**
 * Option model for selection components such as
 * radio button groups and select component
 */
export class McsOption {
  public value: any;
  public text: string;
  public data?: any;
  public helpText?: string;
  public disabled?: boolean;

  constructor(
    _value: any,
    _text: string,
    _helpText?: string,
    _disabled?: boolean,
    _data?: any) {

    this.text = _text;
    this.value = _value;
    this.helpText = _helpText || undefined;
    this.disabled = _disabled || false;
    this.data = _data || null;
  }
}
