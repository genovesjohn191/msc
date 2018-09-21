import { Injectable } from '@angular/core';
import {
  FormGroup,
  FormArray
} from '@angular/forms';
import { isNullOrEmpty } from '@app/utilities';
import { McsScrollDispatcherService } from './mcs-scroll-dispatcher.service';

const FORM_GROUP_SCROLL_OFFSET = 10;

@Injectable()
export class McsFormGroupService {

  constructor(private _scrollDispatcherService: McsScrollDispatcherService) {

  }

  /**
   * Touches all corresponding form controls inside form groups
   * @param formGroup Form group where all the form fields are to be touches
   */
  public touchAllFieldsByFormGroup(formGroup: FormGroup): void {
    let formGroupIsValid = !isNullOrEmpty(formGroup) && formGroup.valid;
    if (formGroupIsValid) { return; }

    Object.keys(formGroup.controls).forEach((key) => {
      formGroup.controls[key].markAsTouched();
    });
  }

  /**
   * Touches all the form fields inside form array
   * @param formArry Form array where all the form fields are to be touches
   */
  public touchAllFieldsByFormArray(formArry: FormArray): void {
    let formsAreValid = !isNullOrEmpty(formArry) && formArry.valid;
    if (formsAreValid) { return; }

    formArry.controls.forEach((formGroup: FormGroup) => {
      this.touchAllFieldsByFormGroup(formGroup);
    });
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
}
