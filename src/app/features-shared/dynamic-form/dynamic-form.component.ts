import {
  Input,
  ViewChildren,
  QueryList,
  OnInit,
  Component
} from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  ValidatorFn
} from '@angular/forms';

import { isNullOrEmpty } from '@app/utilities';
import { CoreValidators } from '@app/core';
import {
  DynamicFormFieldData,
  DynamicFormFieldDataChange
} from './dynamic-form-field-data.interface';
import { DynamicFormField } from './dynamic-form-field.interface';
import { DynamicFormFieldDataBase } from './dynamic-form-field-data.base';

@Component({
  selector: 'mcs-dynamic-form',
  templateUrl: './dynamic-form.component.html'
})
export class DynamicFormComponent implements OnInit {
  @Input()
  public controlDataItems: DynamicFormFieldDataBase[];

  @ViewChildren('control')
  public controls: QueryList<DynamicFormField>;

  public form: FormGroup;
  public submitted: boolean;
  public payLoad: string = '';
  public formStatus: string = '';
  private customValidatorMap: Map<string, ValidatorFn[]>;

  public ngOnInit() {
    this.createCustomValidationMap();

    const formGroup = {};

    this.controlDataItems.forEach(formControl => {
      let validators: ValidatorFn[] = this.getValidators(formControl);
      formGroup[formControl.key] = new FormControl(formControl.value || '', validators);
    });

    this.form = new FormGroup(formGroup);

    this.onChanges();
    this.submitForm();
  }

  private getValidators(controlData: DynamicFormFieldData): ValidatorFn[] {
    let validators: ValidatorFn[] = [];

    if (isNullOrEmpty(controlData)) {
      return validators;
    }

    // Explicit validators based on configuration
    if (!isNullOrEmpty(controlData.validators)) {
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

    // Implicit validators based on control type
    let customValidators = this.customValidatorMap.get(controlData.type);
    if (customValidators) {
      customValidators.forEach(customValidator => {
        validators.push(customValidator);
      });
    }

    return validators;
  }

  public onDataChange(params: DynamicFormFieldDataChange): void {
    if (isNullOrEmpty(params.dependents) || isNullOrEmpty(params.onChangeEvent)) {
      return;
    }
    this.controls.forEach(control => {
      if (params.dependents.indexOf(control.data.key) > -1) {
        control.onFormDataChange(params);
      }
    });
  }

  public submitForm() {
    this.formStatus = this.form.valid ? 'VALID' : 'INVALID';
    this.payLoad = JSON.stringify(this.form.getRawValue(), undefined, 4);
  }

  public isValid(key: string) {
    if (!this.form.controls[key].dirty && !this.form.controls[key].touched) {
      return true;
    }

    return this.form.controls[key].valid;
  }

  // Generic error messages
  public getErrorMessage(key: string): string {
    if (this.form.controls[key].hasError('required')) {
      return 'You must enter a value';
    }
    if (this.form.controls[key].hasError('minlength')) {
      return 'You must enter a minimum of ' + this.form.controls[key].errors.minlength.requiredLength + ' characters';
    }
    if (this.form.controls[key].hasError('min')) {
      return 'Must not be less than' + this.form.controls[key].errors.min.min;
    }
    if (this.form.controls[key].hasError('max')) {
      return 'Must not exceed ' + this.form.controls[key].errors.max.max;
    }
    if (this.form.controls[key].hasError('ipAddress')) {
      return 'Incorrect IP address format';
    }
    if (this.form.controls[key].hasError('domain')) {
      return 'Incorrect domain format';
    }
    if (this.form.controls[key].hasError('hostName')) {
      return 'Incorrect host name format';
    }
  }

  public onChanges(): void {
    this.form.valueChanges.subscribe(val => {
      this.submitForm();
    });
  }

  private createCustomValidationMap() {
    this.customValidatorMap = new Map<string, ValidatorFn[]>();

    this.customValidatorMap.set('textbox-host-name', [CoreValidators.hostName]);
    this.customValidatorMap.set('textbox-domain', [CoreValidators.domain]);
    this.customValidatorMap.set('textbox-ip', [CoreValidators.ipAddress]);
  }
}
