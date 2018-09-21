import {
  FormControl,
  Validators
} from '@angular/forms';
import { isFormControlValid } from './mcs-form.function';

describe('FORM Functions', () => {
  describe('isFormControlValid()', () => {
    it('should return true for the valid form control', () => {
      let formControl = new FormControl('', Validators.required);
      formControl.setValue('something');
      let controlValid = isFormControlValid(formControl);
      expect(controlValid).toBeTruthy();
    });

    it('should return false for the invalid form control', () => {
      let formControl = new FormControl('', Validators.required);
      formControl.markAsTouched();
      let controlValid = isFormControlValid(formControl);
      expect(controlValid).toBeFalsy();
    });
  });
});
