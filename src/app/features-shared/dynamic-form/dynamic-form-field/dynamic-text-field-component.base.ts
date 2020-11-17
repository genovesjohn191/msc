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

  public get id(): string {
    return this.data.key;
  }

  public get label(): string {
    return this.data.label;
  }

  public get required(): boolean {
    return this.data.validators && this.data.validators.required;
  }

  public get visible(): boolean {
    let noSettings = isNullOrEmpty(this.data.settings);
    if (this.required || noSettings) {
      return true;
    }

    return !this.data.settings.hidden;
  }

  public disabled: boolean = false;

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

  public clearFormField(reuseValue: boolean): void {
    let preserveValue = reuseValue && this.data.settings && this.data.settings.preserve;
    if (!preserveValue) {
      this._changeValue('');
    }
  }

  public setInitialValue(value: any): void {
    this.data.initialValue = value;
    this._changeValue(value);
  }

  private _changeValue(value: any): void {
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
}
