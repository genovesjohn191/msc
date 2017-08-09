import { AbstractControl } from '@angular/forms';

/**
 * This will validate if the control is valid when it is already touched.
 * @param control Corresponding control to be check
 * @return TRUE: valid, FALSE: not valid
 */
export function isFormControlValid(control: AbstractControl): boolean {
  // Return valid control flag
  return control ? !(!control.valid && control.touched) : false;
}
