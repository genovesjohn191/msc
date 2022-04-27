/**
 * Option model for selection components such as
 * radio button groups and select component
 */
export class McsOption {
  public value: any;
  public text: string;
  public helpText?: string;
  public disabled?: boolean;

  constructor( _value: any, _text: string, _helpText?: string, _disabled?: boolean) {
    this.text = _text;
    this.value = _value;
    this.helpText = _helpText || undefined;
    this.disabled = _disabled || false;
  }
}
