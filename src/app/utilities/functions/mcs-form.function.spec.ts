import {
  FormControl,
  Validators
} from '@angular/forms';
import { defaultErrorStateMatcher, getSafeFormValue, isFormControlValid } from './mcs-form.function';

describe('FORM Functions', () => {
  describe('isFormControlValid()', () => {
    it('should return true for the valid form control', () => {
      let formControl = new FormControl<any>('', Validators.required);
      formControl.setValue('something');
      let controlValid = isFormControlValid(formControl);
      expect(controlValid).toBeTruthy();
    });

    it('should return false for the invalid form control', () => {
      let formControl = new FormControl<any>('', Validators.required);
      formControl.markAsTouched();
      let controlValid = isFormControlValid(formControl);
      expect(controlValid).toBeFalsy();
    });
  });

  describe('defaultErrorStateMatcher()', () => {
    it('should return false for the valid form control', () => {
      let formControl = new FormControl<any>('', Validators.required);
      formControl.setValue('something');
      let controlInvalid = defaultErrorStateMatcher(formControl, null);
      expect(controlInvalid).toBeFalse();
    });

    it('should return true for the invalid form control', () => {
      let formControl = new FormControl<any>('', Validators.required);
      formControl.markAsTouched();
      let controlInvalid = defaultErrorStateMatcher(formControl, null);
      expect(controlInvalid).toBeTrue();
    });
  });

  describe('getSafeFormValue()', () => {
    it('should return the value of the form control', () => {
      let formControl = new FormControl<any>('something', Validators.required);
      let formControlValue = getSafeFormValue(formControl, (obj) => obj.value);
      expect(formControlValue).toBe('something');
    });
    it('should return null if the form control is disabled', () => {
      let formControl = new FormControl<any>('something', Validators.required);
      formControl.disable();
      let formControlValue = getSafeFormValue(formControl, (obj) => obj.value);

      expect(formControlValue).toBe(null);
    });
    it('should return value if the form control is enabled', () => {
      let formControl = new FormControl<any>('something', Validators.required);
      formControl.enable();
      let formControlValue = getSafeFormValue(formControl, (obj) => obj.value);

      expect(formControlValue).toBe('something');
    });
  });
});
