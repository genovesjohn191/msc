import {
  Directive,
  forwardRef,
  Input,
  SimpleChanges,
  OnChanges
} from '@angular/core';
import {
  NG_VALIDATORS,
  Validator,
  FormControl,
  ValidatorFn,
  ValidationErrors
} from '@angular/forms';
import { CoreValidators } from '@app/core';
import { isNullOrUndefined } from '@app/utilities';

@Directive({
  selector: 'mcs-timepicker[minimumTime]',
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => MinimumTimeValidatorDirective),
      multi: true
    }
  ],
})

export class MinimumTimeValidatorDirective implements Validator, OnChanges {

  private _validator: ValidatorFn;

  @Input()
  public minimumTime: [number, number];

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes.minimumTime) {
      this._validator = CoreValidators.minimumTime(this.minimumTime);
    }
  }

  /**
   * validate method implementation of Validator
   * @param _control form control to validate
   */
  public validate(_control: FormControl): ValidationErrors | null {
    return isNullOrUndefined(this._validator) ? null : this._validator(_control);
  }
}
