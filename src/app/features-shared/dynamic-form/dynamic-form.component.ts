import {
  Input,
  ViewChildren,
  QueryList,
  OnInit,
  Component,
  ChangeDetectorRef, AfterViewInit, EventEmitter, Output
} from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  ValidatorFn
} from '@angular/forms';

import { isNullOrEmpty } from '@app/utilities';
import {
  DynamicFormFieldConfig,
  DynamicFormFieldDataChangeEventParam
} from './dynamic-form-field-config.interface';
import { DynamicFormFieldComponent } from './dynamic-form-field-component.interface';
import { DynamicFormFieldConfigBase } from './dynamic-form-field-config.base';
import { DynamicFormValidationService } from './dynamic-form-validation.service';

@Component({
  selector: 'mcs-dynamic-form',
  templateUrl: './dynamic-form.component.html',
  styleUrls: ['./dynamic-form.scss']
})
export class DynamicFormComponent implements OnInit, AfterViewInit {
  @Input()
  public set config(value: DynamicFormFieldConfigBase[]) {
    this._config = value.sort((value1, value2) => value1.order - value2.order);;
  }

  public get config(): DynamicFormFieldConfigBase[] {
    return this._config;
  }

  private _config: DynamicFormFieldConfigBase[];

  @Input()
  public hideMoreFieldsToggle: boolean = false;

  @Output()
  public afterDataChange: EventEmitter<null>;

  @Output()
  public beforeDataChange: EventEmitter<DynamicFormFieldDataChangeEventParam>;

  @ViewChildren('control')
  public controls: QueryList<DynamicFormFieldComponent>;

  public get valid(): boolean {
    return this.form.valid;
  }

  public get hasFields(): boolean {
    return !isNullOrEmpty(this.config);
  }

  public get hasContextualHelp(): boolean {
    let hasContextualHelp = false;

    this.config.forEach((field) => {
      if (!isNullOrEmpty(field.contextualHelp)) {
        hasContextualHelp = true;
      }
    });

    return hasContextualHelp;
  }

  public hasMoreFields: boolean = false;
  public form: FormGroup;

  private dataChangeEventQueue: DynamicFormFieldDataChangeEventParam[] = [];

  public constructor(
  private _changeDetectorRef: ChangeDetectorRef,
  private _validationService: DynamicFormValidationService) {
    this.afterDataChange = new EventEmitter<null>();
    this.beforeDataChange = new EventEmitter<DynamicFormFieldDataChangeEventParam>();
  }

  public ngOnInit() {
    this.form = this._buildForm();
  }

  public ngAfterViewInit() {
    this._invokeQueuedEvents();
  }

  public getRawValue(): any {
    return this.form.getRawValue();
  }

  public onAfterDataChange(): void {
    this.afterDataChange.emit();
    this.form.updateValueAndValidity();
  }

  // Notify all dependent field controls if data has change
  public onDataChange(params: DynamicFormFieldDataChangeEventParam): void {
    this.beforeDataChange.emit(params);

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

      let fieldIsDependent = params.dependents.indexOf(control.config.key) > -1;
      if (fieldIsDependent) {
        control.onFormDataChange(params);
        this._resetFieldValidators(control);
      }

    });
    this.form.updateValueAndValidity();
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Reset the all fields that do not preserve values
   * @param preserveValues set to false if you want value preserving fields to be cleared
   */
  public resetForm(preserveValues: boolean = true): void {
    this.controls.forEach(control => {
      control.clearFormField(preserveValues);
    });

    this._changeDetectorRef.markForCheck();
  }

  public setValues(properties: any): void {
    if (isNullOrEmpty(properties)) {
      this.resetForm(false);
    }

    this.controls.forEach(control => {
      let value = properties[control.config.key];

      if (!isNullOrEmpty(value)) {
        control.setInitialValue(value);
      }
    });

    this._changeDetectorRef.markForCheck();
  }

  public setFieldProperties(properties: any): void {
    if (isNullOrEmpty(properties)) {
      return;
    }

    // Loop through all of the controls
    this.controls.forEach(control => {
      // Check if a control config is being overriden
      let customProperties = properties[control.config.key];

      if (!isNullOrEmpty(customProperties)) {
        let objectKeys = Object.keys(customProperties);
        let value: any = null;
        // Loop through all the properties in the config that is being overriden
        objectKeys.forEach((fieldKey) => {
          let fieldValue = customProperties[fieldKey];
          control.config[fieldKey] = fieldValue;

          // Take note of value override so we can initialize it later
          if (fieldKey === 'value' && !isNullOrEmpty(fieldValue)) {
           value = fieldValue;
          }
        })

        // Initialize the value of the control if it's not empty
        if (!isNullOrEmpty(value)) {
          control.setInitialValue(value);
        }
      }
    });

    this._changeDetectorRef.markForCheck();
  }

  public isValidField(key: string) {
    if ((!this.form.controls[key].dirty && !this.form.controls[key].touched)) {
      return true;
    }

    return this.form.controls[key].valid;
  }

  // Generic error messages for validations
  public getErrorMessage(key: string): string {
    return this._validationService.getErrorMessage(this.form.controls[key]);
  }

  public markAsTouched(): void {
    this._markThisAsTouched(this.form);
  }

  public setFieldVisiblity(visible: boolean): void {
    this.controls.forEach(control => {

      if (!isNullOrEmpty(control.config.settings)) {
        control.config.settings.hidden = !visible;
      }
    });

    this._changeDetectorRef.markForCheck();
  }

  private _buildForm(): FormGroup {
    const formGroup = {};
    this.config.forEach(formControl => {
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

  private _getValidators(controlData: DynamicFormFieldConfig): ValidatorFn[] {
    return this._validationService.getValidators(controlData);
  }

  private _resetFieldValidators(control: DynamicFormFieldComponent): void {
    let key = control.config.key;

    if (control.visible) {
      this.form.controls[key].setValidators(this._getValidators(control.config));
    } else {
      this.form.controls[key].markAsPristine();
      this.form.controls[key].clearValidators();
    }

    this.form.controls[control.config.key].updateValueAndValidity();
  }

  private _invokeQueuedEvents(): void {
    while (this.dataChangeEventQueue.length > 0) {
      this.onDataChange(this.dataChangeEventQueue.shift());
    }
  }
}
