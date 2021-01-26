import {
  Component,
  Input
} from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';

@Component({ template: '' })
export abstract class FormFieldBaseComponent<TValue> implements ControlValueAccessor {
  @Input()
  public disabled: boolean;

  @Input()
  public placeholder: string;

  // The value returned from the form field
  private _value : TValue;
  public get value() : TValue { return this._value; }
  public set value(value: TValue) { this.writeValue(value); }

  protected _onChange = (value: TValue) => { };
  protected _onTouched = () => { };

  public writeValue(value: TValue): void {
    this._value = value;
    this._onChange(this.value)
  }

  public registerOnChange(fn: (value: TValue) => void): void {
    this._onChange = fn;
  }

  public registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }

  public setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
