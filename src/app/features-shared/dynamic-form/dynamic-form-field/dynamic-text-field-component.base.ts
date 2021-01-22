import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output
} from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { isNullOrEmpty } from '@app/utilities';

import { DynamicFormFieldConfigBase } from '../dynamic-form-field-config.base';
import { DynamicFormFieldDataChangeEventParam, DynamicFormFieldOnChangeEvent } from '../dynamic-form-field-config.interface';
import { DynamicFormFieldComponent } from '../dynamic-form-field-component.interface';

@Component({ template: '' })
export abstract class DynamicTextFieldComponentBase implements OnInit, DynamicFormFieldComponent, ControlValueAccessor {
  @Input()
  public config: DynamicFormFieldConfigBase;

  @Output()
  public dataChange: EventEmitter<DynamicFormFieldDataChangeEventParam> = new EventEmitter<DynamicFormFieldDataChangeEventParam>();

  public get id(): string {
    return this.config.key;
  }

  public get label(): string {
    return this.config.label;
  }

  public get required(): boolean {
    return this.config.validators && this.config.validators.required;
  }

  public get visible(): boolean {
    let noSettings = isNullOrEmpty(this.config.settings);
    if (this.required || noSettings) {
      return true;
    }

    return !this.config.settings.hidden;
  }

  public disabled: boolean = false;

  public ngOnInit(): void {
    if (!isNullOrEmpty(this.config.initialValue)) {
      this.setInitialValue(this.config.initialValue);
    }
  }

  // Can be overriden to modify the value being sent
  public notifyForDataChange(eventName: DynamicFormFieldOnChangeEvent, dependents: string[], value?: any): void {
    this.dataChange.emit({
      value: value,
      eventName: eventName,
      dependents: dependents
    });
  }

  public valueChange(val: any): void {
    let validEvent = !isNullOrEmpty(this.config.eventName) && !isNullOrEmpty(this.config.dependents);
    if (validEvent) {
      this.notifyForDataChange(this.config.eventName, this.config.dependents, this.config.value);
    }

    this.propagateChange(this.config.value);
  }

  public abstract onFormDataChange(params: DynamicFormFieldDataChangeEventParam): void;

  public clearFormField(reuseValue: boolean): void {
    let preserveValue = reuseValue && this.config.settings && this.config.settings.preserve;
    if (!preserveValue) {
      if (typeof this.config.value === 'boolean') {
        this._changeValue(false);
      } else {
        this._changeValue('');
      }
    }
  }

  public setInitialValue(value: any): void {
    this.config.initialValue = value;
    this._changeValue(value);
  }

  public writeValue(obj: any): void {
    if (!isNullOrEmpty(obj)) {
      this.config.value = obj;
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

  private _changeValue(value: any): void {
    this.config.value = value;
    this.valueChange(this.config.value);
  }
}
