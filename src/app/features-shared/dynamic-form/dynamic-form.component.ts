import {
  Input,
  ViewChildren,
  QueryList,
  OnInit,
  Component,
  ChangeDetectorRef, AfterViewInit
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
  DynamicFormFieldDataChangeEventParam
} from './dynamic-form-field-data.interface';
import { DynamicFormField } from './dynamic-form-field.interface';
import { DynamicFormFieldDataBase } from './dynamic-form-field-data.base';

@Component({
  selector: 'mcs-dynamic-form',
  templateUrl: './dynamic-form.component.html',
  styleUrls: ['./dynamic-form.scss']
})
export class DynamicFormComponent implements OnInit, AfterViewInit {
  @Input()
  public controlDataItems: DynamicFormFieldDataBase[];

  @Input()
  public hideMoreFieldsToggle: boolean = false;

  @ViewChildren('control')
  public controls: QueryList<DynamicFormField>;

  public hasMoreFields: boolean = false;
  public form: FormGroup;

  private customValidatorMap: Map<string, ValidatorFn[]>;
  private dataChangeEventQueue: DynamicFormFieldDataChangeEventParam[] = [];

  public constructor(private _changeDetectorRef: ChangeDetectorRef) {}

  public ngOnInit() {
    this._createCustomValidationMap();
    this.form = this._buildForm();
  }

  public ngAfterViewInit() {
    this._invokeQueuedEvents();
  }

  public getRawValue(): any {
    return this.form.getRawValue();
  }

  // Notify all dependent field controls if data has change
  public onDataChange(params: DynamicFormFieldDataChangeEventParam): void {
    let valid = !isNullOrEmpty(params.dependents) && !isNullOrEmpty(params.eventName);
    if (!valid) {
      return;
    }

    // Add event to queue if not controls are not ready
    let controlReady = !isNullOrEmpty(this.controls);
    if (!controlReady) {
      this.dataChangeEventQueue.push(params);
      return;
    }

    // Trigger data change event
    this.controls.forEach(control => {
      if (params.dependents.indexOf(control.data.key) > -1) {
        control.onFormDataChange(params);
      }
    });
  }

  /**
   * Reset the all fields that do not preserve values
   * @param preserveValues set to false if you want value preserving fields to be cleared
   */
  public resetForm(preserveValues: boolean = true): void {
    this.controls.forEach(control => {
      control.clearFormFields(preserveValues);
    });

    this._changeDetectorRef.markForCheck();
  }

  public setValues(properties: any): void {
    if (isNullOrEmpty(properties)) {
      this.resetForm(false);
    }

    this.controls.forEach(control => {
      let value = properties[control.data.key];

      if (!isNullOrEmpty(value)) {
        control.setValue(value);
      }
    });

    this._changeDetectorRef.markForCheck();
  }

  public isValid(key: string) {
    if (!this.form.controls[key].dirty && !this.form.controls[key].touched) {
      return true;
    }

    return this.form.controls[key].valid;
  }

  // Generic error messages for validations
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

  public markAsTouched(): void {
    this._markThisAsTouched(this.form);
  }

  public setFieldVisiblity(visible: boolean) {
    this.setHiddenFieldsVisibility(visible);
  }

  private setHiddenFieldsVisibility(visible: boolean): void {
    this.controls.forEach(control => {
      if (!isNullOrEmpty(control.data.settings)) {
        control.data.settings.hidden = !visible;
      }
    });

    this._changeDetectorRef.markForCheck();
  }

  private _buildForm(): FormGroup {
    const formGroup = {};
    this.controlDataItems.forEach(formControl => {
      let validators: ValidatorFn[] = this._getValidators(formControl);
      formGroup[formControl.key] = new FormControl(formControl.value || '', validators);

      if (!this.hasMoreFields && formControl.settings && formControl.settings.hidden) {
        this.hasMoreFields = true;
      }
    });

    return new FormGroup(formGroup);
  }

  private _markThisAsTouched(formGroup: FormGroup): void {
    (Object as any).values(formGroup.controls).forEach((control) => {
      control.markAsTouched();

      if (control.controls) {
        this._markThisAsTouched(control);
      }
    });
  }

  private _createCustomValidationMap() {
    this.customValidatorMap = new Map<string, ValidatorFn[]>();

    this.customValidatorMap.set('textbox-host-name', [CoreValidators.hostName]);
    this.customValidatorMap.set('textbox-domain', [CoreValidators.domain]);
    this.customValidatorMap.set('textbox-ip', [CoreValidators.ipAddress]);
  }

  private _getValidators(controlData: DynamicFormFieldData): ValidatorFn[] {
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

  private _invokeQueuedEvents(): void {
    while (this.dataChangeEventQueue.length > 0) {
      this.onDataChange(this.dataChangeEventQueue.shift());
    }
  }
}
