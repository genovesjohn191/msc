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
    selector: 'mcs-timepicker[maximumTime]',
    providers: [
      {
        provide: NG_VALIDATORS,
        useExisting: forwardRef(() => MaximumTimeValidatorDirective),
        multi: true
      }
    ],
  })

export class MaximumTimeValidatorDirective implements Validator, OnChanges {

    private _validator: ValidatorFn;
    // TODO:create test suite for this
    @Input()
    public maximumTime: [number, number];

    public ngOnChanges(changes: SimpleChanges): void {
      if (changes.maximumTime) {
        this._validator = CoreValidators.maximumTime(this.maximumTime);
      }
    }

    /**
     * validate method implementation of Validator
     * @param _control form control to validate
     */
    public validate(_control: FormControl<any>): ValidationErrors | null {
      return isNullOrUndefined(this._validator) ? null : this._validator(_control);
    }
}
