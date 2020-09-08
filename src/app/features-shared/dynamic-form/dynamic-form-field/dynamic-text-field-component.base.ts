import {
  Input,
  EventEmitter,
  Output
} from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { isNullOrEmpty } from '@app/utilities';
import { DynamicFormField } from '../dynamic-form-field.interface';
import { DynamicFormFieldDataChange } from '../dynamic-form-field-data.interface';
import { DynamicFormFieldDataBase } from '../dynamic-form-field-data.base';

export abstract class DynamicTextFieldComponentBase implements DynamicFormField, ControlValueAccessor {
  @Input()
  public data: DynamicFormFieldDataBase;

  @Output()
  public dataChange: EventEmitter<DynamicFormFieldDataChange> = new EventEmitter<DynamicFormFieldDataChange>();

  // Can be overriden to modify the value being sent
  public valueChange(val: any): void {
    this.dataChange.emit(this.data);
    this.propagateChange(this.data.value);
  }

  public abstract onFormDataChange(params: DynamicFormFieldDataChange): void;

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
