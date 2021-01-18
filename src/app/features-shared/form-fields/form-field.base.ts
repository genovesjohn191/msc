import {
  Component,
  Input
} from '@angular/core';

@Component({ template: '' })
export abstract class FormFieldBaseComponent<TValue> {
  @Input()
  public disabled: boolean;

  @Input()
  public placeholder: string;

  protected _onChange = (value: TValue) => { };
  protected _onTouched = () => { };
}
