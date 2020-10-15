import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { isNullOrEmpty } from '@app/utilities';

import { DynamicFormFieldDataBase } from '../dynamic-form-field-data.base';
import { DynamicFormFieldDataChangeEventParam } from '../dynamic-form-field-data.interface';
import { DynamicFormField } from '../dynamic-form-field.interface';

@Component({ template: '' })
export abstract class DynamicTextFieldComponentBase implements DynamicFormField, ControlValueAccessor {
  @Input()
  public data: DynamicFormFieldDataBase;

  @Output()
  public dataChange: EventEmitter<DynamicFormFieldDataChangeEventParam> = new EventEmitter<DynamicFormFieldDataChangeEventParam>();

  // Can be overriden to modify the value being sent
  public valueChange(val: any): void {
    this.dataChange.emit({
      value: this.data.value,
      eventName: this.data.eventName,
      dependents: this.data.dependents
    });
    this.propagateChange(this.data.value);
  }

  public abstract onFormDataChange(params: DynamicFormFieldDataChangeEventParam): void;

  public clearFormFields(reuseValue: boolean): void {
    let preserveValue = reuseValue && this.data.settings && this.data.settings.preserve;
    if (!preserveValue) {
      this._resetValue('');
    }
  }

  private _resetValue(value: any): void {
    this.data.value = value;
    this.valueChange(this.data.value);
  }

  public writeValue(obj: any): void {
    if (!isNullOrEmpty(obj)) {
      this.data.value = obj;
    }
  }

  public registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }

  public registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  public setDisabledState?(isDisabled: boolean): void {
  }

  public propagateChange = (_: any) => {};

  public onTouched = () => {};

  public isVisible(): boolean {
    let required = this.data.validators && this.data.validators.required;
    let noSettings = isNullOrEmpty(this.data.settings);
    if (required || noSettings) {
      return true;
    }

    return !this.data.settings.hidden;
  }
}
