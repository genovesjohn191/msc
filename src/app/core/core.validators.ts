import {
  AbstractControl,
  Validators,
  ValidatorFn,
  ValidationErrors,
  AsyncValidatorFn
} from '@angular/forms';
import {
  Observable,
  of
} from 'rxjs';
import {
  catchError,
  map
} from 'rxjs/operators';
import { IMcsProperty } from './interfaces/mcs-property.interface';
import { CommonDefinition } from '@app/utilities';

export class CoreValidators {

  /**
   * Validator that performs ip address validation
   *
   * `@Note` This will produce the following value when false
   * { 'ip': true }
   */
  public static ipAddress(control: AbstractControl): ValidationErrors | null {
    return CommonDefinition.REGEX_IP_PATTERN.test(control.value) ? null : { ipAddress: true };
  }

  /**
   * Validator that performs numeric values validation
   *
   * `@Note` This will produce the following value when false
   * { 'numeric': true }
   */
  public static numeric(control: AbstractControl): ValidationErrors | null {
    return CommonDefinition.REGEX_NUMERIC_PATTERN.test(control.value) ? null : { numeric: true };
  }

  /**
   * Validator that performs alpha numeric values validation
   *
   * `@Note` This will produce the following value when false
   * { alphaNumeric: true }
   */
  public static alphaNumeric(control: AbstractControl): ValidationErrors | null {
    return CommonDefinition.REGEX_ALPHANUMERIC_PATTERN.test(control.value) ?
      null : { alphaNumeric: true };
  }

  /**
   * Validator that requires controls to have a non-empty value
   *
   * `@Note` This will produce the following value when false
   * {'required': true}
   */
  public static required(control: AbstractControl): ValidationErrors | null {
    return Validators.required(control) === null ?
      control.value.toString().trim().length === 0 ? { 'required': true }
        : null : Validators.required(control);
  }

  /**
   * Validator that performs url values validation
   */
  public static url(control: AbstractControl): ValidationErrors | null {
    return CommonDefinition.REGEX_URL_PATTERN.test(control.value) ?
      null : { url: true };
  }

  /**
   * Validator that performs email validation
   *
   * `@Note` This will produce the following value when false
   * {'email': true}
   */
  public static email(control: AbstractControl): ValidationErrors | null {
    return Validators.email(control);
  }

  /**
   * Validator that performs custom validation
   *
   * `@Note` This will produce the following value when false
   * { custom: { message: customMessage }}
   */
  public static custom(
    predicate: (validation: any) => boolean,
    patternName: string
  ): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      let patternData: IMcsProperty<any> = {};
      patternData[patternName] = true;

      return !predicate(control.value) ? patternData : null;
    };
  }

  /**
   * Async Validator that performs custom validation
   *
   * `@Note` This will produce the following value when false
   * { custom: { message: customMessage }}
   */
  public static customAsync(
    predicate: (validation: any) => Observable<boolean>,
    patternName: string
  ): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      let patternData: IMcsProperty<any> = {};
      patternData[patternName] = true;

      return predicate(control.value).pipe(
        catchError((_error) => of(patternData)),
        map((response) => response ? null : patternData)
      );
    };
  }

  /**
   * Validator that requires a control to match a regex to its value
   *
   * `@Note` This will produce the following value when false
   * {'pattern': {'requiredPattern': regexStr, 'actualValue': value}}
   */
  public static pattern(pattern: string | RegExp): ValidatorFn {
    return Validators.pattern(pattern);
  }

  /**
   * Validator that requires controls to have a value of a minimum length
   *
   * `@Note` This will produce the following value when false
   * {'minlength': {'requiredLength': minLength, 'actualLength': length}}
   */
  public static minLength(minLength: number): ValidatorFn {
    return Validators.minLength(minLength);
  }

  /**
   * Validator that requires controls to have a value of a maximum length
   *
   * `@Note` This will produce the following value when false
   * {'maxlength': {'requiredLength': maxLength, 'actualLength': length}}
   */
  public static maxLength(maxLength: number): ValidatorFn {
    return Validators.maxLength(maxLength);
  }

  /**
   * Validator that requires controls to have a value greater than a number.
   *
   * `@Note` This will produce the following value when false
   * {'min': {'min': min, 'actual': control.value}}
   */
  public static min(minValue: number): ValidatorFn {
    return Validators.min(minValue);
  }

  /**
   * Validator that requires controls to have a value less than a number
   *
   * `@Note` This will produce the following value when false
   * {'max': {'max': max, 'actual': control.value}}
   */
  public static max(maxValue: number): ValidatorFn {
    return Validators.max(maxValue);
  }
}
