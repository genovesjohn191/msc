import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';

import {
  isNullOrEmpty,
  isNullOrUndefined
} from '@app/utilities';
import { GenericFormFieldComponent } from './generic-form-field.interface';

@Component({ template: '' })
export abstract class GenericFormFieldComponentBase implements ControlValueAccessor, GenericFormFieldComponent {
  @Input()
  public id: string;

  @Input()
  public label: string;

  @Input()
  placeholder: string;

  @Input()
  public visible: boolean;

  @Input()
  public disabled: boolean;

  @Input()
  public required: boolean;

  @Input()
  public get value(): any {
    return this._value;
  }
  public set value(obj: any) {
    this._value = obj;
    this.valueChange(obj);
  }
  private _value: any;

  @Output()
  public onValueChanged: EventEmitter<any> = new EventEmitter();

  public writeValue(obj: any): void {
    if (obj === this.value) { return; }

    if (isNullOrEmpty(obj) && typeof this.value === 'boolean') {
      obj = false;
    }
    if (!isNullOrUndefined(obj)) {
      this.value = obj;
    }
  }

  protected valueChange(val: any): void {
    this.propagateChange(val);
    this.onValueChanged.emit(val);
  }

  public registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }

  public registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  public setDisabledState?(isDisabled: boolean): void { }

  public propagateChange = (_: any) => {};

  public onTouched = () => {};
}