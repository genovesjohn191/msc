/**
 * Option model for selection components such as
 * radio button groups and select component
 */
export class McsOption {
  public value: any;
  public text: string;

  constructor( _value: any, _text: string) {
    this.text = _text;
    this.value = _value;
  }
}
