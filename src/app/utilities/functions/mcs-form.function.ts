import {
  AbstractControl,
  FormControl,
  FormGroupDirective,
  NgForm
} from '@angular/forms';
import { getSafeProperty } from './mcs-object.function';

/**
 * This will validate if the control is valid when it is already touched.
 * @param control Corresponding control to be check
 * @return TRUE: valid, FALSE: not valid
 */
export function isFormControlValid(control: AbstractControl): boolean {
  // Return valid control flag
  return control ? !(!control.valid && control.touched) : false;
}

/**
 * Returns whether control is invalid and is either touched or is a part of a submitted form.
 * @param control Corresponding control to be check
 * @param form Parent form of the form control field
 */
export function defaultErrorStateMatcher(control: FormControl, form: FormGroupDirective | NgForm) {
  return !!(control && control.invalid && (control.touched || (form && form.submitted)));
}

/**
 * Returns the safe value of the form based on the object to access the deep property
 * @param formControl Form Object to get deep property
 * @param predicateOperator Function that returns the deep property
 * @param valueIfFail Value to return in case if there is no such property
 */
export function getSafeFormValue<T>(
  formControl: FormControl,
  predicateOperator: (x: FormControl) => T,
  valueIfFail: any = null
): T {
  let isFormControlIncluded = formControl && formControl.enabled;
  return isFormControlIncluded ?
    getSafeProperty(formControl, predicateOperator) :
    valueIfFail;
}

/**
 * Delegate type for the error state matcher
 */
export type ErrorStateMatcher =
  (control: FormControl, form: FormGroupDirective | NgForm) => boolean;
