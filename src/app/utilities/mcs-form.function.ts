import {
  AbstractControl,
  FormControl,
  FormGroupDirective,
  NgForm
} from '@angular/forms';

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
 * Delegate type for the error state matcher
 */
export type ErrorStateMatcher =
  (control: FormControl, form: FormGroupDirective | NgForm) => boolean;
