import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output
} from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { isNullOrEmpty, isNullOrUndefined } from '@app/utilities';

import { DynamicFormFieldConfigBase } from '../dynamic-form-field-config.base';
import { DynamicFormFieldDataChangeEventParam, DynamicFormFieldOnChangeEvent } from '../dynamic-form-field-config.interface';
import { DynamicFormFieldComponent } from '../dynamic-form-field-component.interface';

@Component({ template: '' })
export abstract class DynamicFieldComponentBase implements OnInit, DynamicFormFieldComponent, ControlValueAccessor {
  @Input()
  public config: DynamicFormFieldConfigBase;

  @Output()
  public dataChange: EventEmitter<DynamicFormFieldDataChangeEventParam> = new EventEmitter<DynamicFormFieldDataChangeEventParam>();

  @Output()
  public afterDataChange: EventEmitter<null> = new EventEmitter<null>();

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

  private _hasInitializedOnVisibilityUpdate: boolean = false;

  public ngOnInit(): void {
    if (!isNullOrUndefined(this.config.initialValue)) {
      this.setInitialValue(this.config.initialValue);
    }
  }

  // Can be overriden to modify the value being sent
  public notifyForDataChange(eventName: DynamicFormFieldOnChangeEvent, dependents: string[], value?: any): void {
    this.dataChange.emit({
      value,
      eventName,
      dependents
    });
  }

  public valueChange(val: any): void {
    this.notifyForDataChange(this.config.eventName, this.config.dependents, this.config.value);
    this.propagateChange(this.config.value);
    this.afterDataChange.emit();
  }

  public abstract onFormDataChange(params: DynamicFormFieldDataChangeEventParam): void;

  public clearFormField(reuseValue: boolean): void {
    let preserveValue = reuseValue && this.config.settings && this.config.settings.preserve;
    if (preserveValue) { return; }

    // Use appropriate default empty values based on object type
    if (this.config.value instanceof Array) {
      this.changeValue([]);
    } else if (typeof this.config.value === 'object') {
      this.changeValue(null);
    } else if (typeof this.config.value === 'boolean') {
      this.changeValue(false);
    } else {
      this.changeValue('');
    }
  }

  public setInitialValue(value: any): void {
    this.config.initialValue = value;
    this.changeValue(value);
  }

  public writeValue(obj: any): void {
    if (isNullOrEmpty(obj) && typeof this.config.value === 'boolean') {
      obj = false;
    }
    if (!isNullOrUndefined(obj)) {
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

  protected changeValue(value: any): void {
    this.config.value = value;
    this.valueChange(this.config.value);
  }

  protected updateVisiblityBasedOnRequirement(required: boolean): void {
    let hasValidators = !isNullOrEmpty(this.config.validators);
    if (hasValidators) {
      this.config.validators.required = required
    } else {
      this.config.validators = { required };
    }

    let hasSettings = !isNullOrEmpty(this.config.settings);
    if (hasSettings) {
      this.config.settings.hidden = !required;
    } else {
      this.config.settings = { hidden: !required };
    }

    this.disabled = !required;

    this.clearFormField(false);

    // Set initial value if required
    if (required && !this._hasInitializedOnVisibilityUpdate) {
      this.setInitialValue(this.config.initialValue);
      this._hasInitializedOnVisibilityUpdate = true;
    }
  }
}
