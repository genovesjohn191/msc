import { Injectable } from '@angular/core';
import {
  FormGroup,
  FormArray,
  FormControl
} from '@angular/forms';
import {
  isNullOrEmpty,
  getSafeProperty
} from '@app/utilities';
import { McsScrollDispatcherService } from './mcs-scroll-dispatcher.service';

const FORM_GROUP_SCROLL_OFFSET = 10;

@Injectable()
export class McsFormGroupService {

  constructor(private _scrollDispatcherService: McsScrollDispatcherService) { }

  /**
   * Touch all form fields by form group
   * @param formGroup Form group to be touched
   */
  public touchAllFormFields(formGroup: FormGroup): void;

  /**
   * Touch all form fields by form array
   * @param formArray Form array which to touch the controls
   */
  public touchAllFormFields(formArray: FormArray): void;

  /**
   * Touch all form fields based on the main content type
   * @param formMainContent Main form content per type
   */
  public touchAllFormFields(formMainContent: FormGroup | FormArray): void {
    if (isNullOrEmpty(formMainContent)) { return; }

    formMainContent instanceof FormGroup ?
      this._touchAllFormFieldsByFormGroup(formMainContent) :
      formMainContent.controls.forEach(this._touchAllFormFieldsByFormGroup.bind(this));
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
