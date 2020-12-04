import { Injectable } from '@angular/core';
import {
  AbstractControl,
  ValidatorFn,
  Validators
} from '@angular/forms';

import { CoreValidators } from '@app/core';
import { isNullOrEmpty } from '@app/utilities';
import { DynamicFormFieldConfig, DynamicFormFieldType } from './dynamic-form-field-config.interface';

@Injectable()
export class DynamicFormValidationService {
  private _customValidatorMap: Map<string, ValidatorFn[]>;

  public constructor() {
    this._initializeCustomValidatorMap();
  }

  public getErrorMessage(control: AbstractControl): string {
    if (control.hasError('required')) {
      return 'You must enter a value';
    }
    if (control.hasError('minlength')) {
      return 'You must enter a minimum of ' + control.errors.minlength.requiredLength + ' characters';
    }
    if (control.hasError('min')) {
      return 'Must not be less than ' + control.errors.min.min;
    }
    if (control.hasError('max')) {
      return 'Must not exceed ' + control.errors.max.max;
    }
    if (control.hasError('ipAddress')) {
      return 'Incorrect IP address format';
    }
    if (control.hasError('domain')) {
      return 'Incorrect domain format';
    }
    if (control.hasError('hostName')) {
      return 'Incorrect host name format';
    }
  }

  public getValidators(controlData: DynamicFormFieldConfig): ValidatorFn[] {
    let validators: ValidatorFn[] = [];

    if (isNullOrEmpty(controlData)) {
      return validators;
    }

    // Validators based on configuration params
    let hasExplicitValidators = !isNullOrEmpty(controlData.validators);
    if (hasExplicitValidators) {
      if (controlData.validators.required) {
        validators.push(Validators.required);
      }
      if (controlData.validators.minlength > 0) {
        validators.push(Validators.minLength(controlData.validators.minlength));
      }
      if (controlData.validators.maxlength > 0) {
        validators.push(Validators.maxLength(controlData.validators.maxlength));
      }
      if (controlData.validators.min > 0) {
        validators.push(Validators.min(controlData.validators.min));
      }
      if (controlData.validators.max > 0) {
        validators.push(Validators.max(controlData.validators.max));
      }
    }

    // Validators based on field type
    let customValidators = this._customValidatorMap.get(controlData.type);
    let hasImplicitValidators = !isNullOrEmpty(customValidators);
    if (hasImplicitValidators) {
      customValidators.forEach(customValidator => {
        validators.push(customValidator);
      });
    }

    return validators;
  }

  private _initializeCustomValidatorMap(): void {
    this._customValidatorMap = new Map<DynamicFormFieldType, ValidatorFn[]>();

    this._customValidatorMap.set('textbox-domain', [CoreValidators.domain]);
    this._customValidatorMap.set('textbox-ip', [CoreValidators.ipAddress]);
  }
}
