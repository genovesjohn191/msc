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
  selector: 'mcs-timepicker[required], mcs-datetimepicker[required]',
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => RequiredValidatorDirective),
      multi: true
    }
  ],
})

export class RequiredValidatorDirective implements Validator, OnChanges {

  private _validator: ValidatorFn;

  @Input()
  public get required(): boolean { return this._required; }
  public set required(flag: boolean) { this._required = flag; }
  private _required: boolean;

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes.required) {
      this._validator = CoreValidators.required;
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
