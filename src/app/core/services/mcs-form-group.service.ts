import { Injectable } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormControl,
  FormGroup
} from '@angular/forms';
import {
  getSafeProperty,
  isNullOrEmpty
} from '@app/utilities';

import { McsScrollDispatcherService } from './mcs-scroll-dispatcher.service';

const FORM_GROUP_SCROLL_OFFSET = 10;

@Injectable()
export class McsFormGroupService {

  constructor(private _scrollDispatcherService: McsScrollDispatcherService) { }

  /**
   * Touch all form fields based on the main content type
   * @param formMainContent Main form content per type
   */
  public touchAllFormFields(formGroup: FormGroup): void;
  public touchAllFormFields(formArray: FormArray): void;
  public touchAllFormFields(formMainContent: FormGroup | FormArray): void {
    if (isNullOrEmpty(formMainContent)) { return; }

    formMainContent instanceof FormGroup ?
      this._touchAllFormFieldsByFormGroup(formMainContent) :
      formMainContent.controls.forEach(this._touchAllFormFieldsByFormGroup.bind(this));
  }

  /**
   * Returns true when all form fields are valid by Form Group
   */
  public allFormFieldsValid(formGroup: FormGroup): boolean {
    let formControls = this.getFormControls(formGroup);
    let formsAreMissing = isNullOrEmpty(formGroup) || isNullOrEmpty(formControls);
    if (formsAreMissing) { return false; }

    let hasInvalid: boolean = false;
    formControls.map((formField) => {
      if (!hasInvalid && formField.invalid && formField.enabled) {
        hasInvalid = formField.invalid;
      }
    });
    return !hasInvalid;
  }

  /**
   * Gets all associated form controls from group
   */
  public getFormControls(formGroup: FormGroup): AbstractControl[] {
    let controls = getSafeProperty(formGroup, (obj) => obj.controls);
    if (isNullOrEmpty(controls)) { return undefined; }

    let controlKeys = Object.keys(controls);
    let convertedControls = controlKeys.map((key) => controls[key]);
    return convertedControls;
  }

  /**
   * Scrolls to first invalid element based on the children of the given host
   * @param host Host to be served as the based were to get the invalid elements
   */
  public scrollToFirstInvalidField(host: HTMLElement): void {
    if (isNullOrEmpty(host)) { return; }
    let firstInvalidElement = host.querySelector('mcs-form-field.ng-invalid');
    this._scrollDispatcherService.scrollToElement(
      firstInvalidElement as HTMLElement, FORM_GROUP_SCROLL_OFFSET);
  }

  /**
   * Resets all controls
   */
  public resetAllControls(formGroup: FormGroup): void {
    let formControls = this.getFormControls(formGroup);
    let formsAreMissing = isNullOrEmpty(formGroup) || isNullOrEmpty(formControls);
    if (formsAreMissing) { return; }

    formControls.map((formField) => {
      formField.reset();
    });
  }

  /**
   * This will mark the form control as invalid
   * @param formControl Form control to be marked
   */
  private _markInvalidFormControl(formControl: FormControl): void {
    if (isNullOrEmpty(formControl)) { return; }
    formControl.markAsTouched();
  }

  /**
   * Touches all form fields by form group
   * @param formGroup Form group for the form fields
   */
  private _touchAllFormFieldsByFormGroup(formGroup: FormGroup): void {
    let formGroupIsValid = getSafeProperty(formGroup, (obj) => obj.valid);
    if (formGroupIsValid) { return; }

    Object.keys(formGroup.controls).forEach((key) => {
      formGroup.controls[key] instanceof FormGroup ?
        this._touchAllFormFieldsByFormGroup(formGroup.controls[key] as FormGroup) :
        this._markInvalidFormControl(formGroup.controls[key] as FormControl);
    });
  }
}
