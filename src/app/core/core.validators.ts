import {
  of,
  Observable
} from 'rxjs';
import {
  catchError,
  map
} from 'rxjs/operators';

import {
  AbstractControl,
  AsyncValidatorFn,
  ValidationErrors,
  Validators,
  ValidatorFn
} from '@angular/forms';
import {
  isNullOrEmpty,
  CommonDefinition
} from '@app/utilities';

import { IMcsProperty } from './interfaces/mcs-property.interface';

export class CoreValidators {

  /**
   * Validator that performs ip address validation
   *
   * `@Note` This will produce the following value when false
   * { 'ipAddress': true }
   */
  public static ipAddress(control: AbstractControl): ValidationErrors | null {
    return CommonDefinition.REGEX_IP_PATTERN.test(control.value) ? null : { ipAddress: true };
  }

  /**
   * Validator that performs ip address with shorthand mask validation
   *
   * `@Note` This will produce the following value when false
   * { 'ipAddressShortHandMask': true }
   */
  public static ipAddressShortHandMask(control: AbstractControl): ValidationErrors | null {
    return CommonDefinition.REGEX_IP_PATTERN_SHORTHAND_MASK.test(control.value) ? null : { ipAddressShortHandMask: true };
  }

  /**
   * Validator that performs hostname validation
   *
   * `@Note` This will produce the following value when false
   * { 'hostName': true }
   */
  public static hostName(control: AbstractControl): ValidationErrors | null {
    return CommonDefinition.REGEX_HOSTNAME_PATTERN.test(control.value) ? null : { hostName: true };
  }

  /**
   * Validator that performs numeric values validation
   *
   * `@Note` This will produce the following value when false
   * { 'numeric': true }
   */
  public static numeric(control: AbstractControl): ValidationErrors | null {
    if (isNullOrEmpty(control.value)) { return null; }
    return CommonDefinition.REGEX_NUMERIC_PATTERN.test(control.value) ? null : { numeric: true };
  }

  /**
   * Validator that performs decimal values validation
   *
   * `@Note` This will produce the following value when false
   * { 'decimal': true }
   */
  public static decimal(control: AbstractControl): ValidationErrors | null {
    return CommonDefinition.REGEX_DECIMAL_PATTERN.test(control.value) ? null : { decimal: true };
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
    if (isNullOrEmpty(control.value)) { return null; }
    return CommonDefinition.REGEX_URL_PATTERN.test(control.value) ?
      null : { url: true };
  }

  /**
   * Validator that performs domain validation
   * e.g. of valid values
   *  xn--stackoverflow.com
   *  stackoverflow.xn--com
   *  stackoverflow.co.uk
   */
  public static domain(control: AbstractControl): ValidationErrors | null {
    return CommonDefinition.REGEX_DOMAIN_PATTERN.test(control.value) ? null : { domain: true };
  }

  /**
   * Validator that performs fqdn domain validation
   * e.g. of valid values
   *  ec2-35-160-210-253.us-west-2-.compute.amazonaws.com
   *  1.2.3.4.com
   *  xn--d1aacihrobi6i.xn--p1ai
   */
  public static fqdnDomain(control: AbstractControl): ValidationErrors | null {
    return CommonDefinition.REGEX_FQDN_DOMAIN_PATTERN.test(control.value) ? null : { fqdnDomain: true };
  }

  public static shortCustomerName(control: AbstractControl): ValidationErrors | null {
    return CommonDefinition.REGEX_SHORT_CUSTOMER_NAME_PATTERN.test(control.value) ? null : { shortCustomerName: true };
  }

  public static maxSize(size: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      let error = { 'maxSize': { actual: control.value, maxSize: size } };
      return +control.value > size ? error : null;
    };
  }

  public static minSize(size: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      let error = { 'minSize': { actual: control.value, minSize: size } };
      return +control.value < size ? error : null;
    };
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

  /**
   * Validator that requires controls to be of multiple of the given value
   *
   * `@Note` This will produce the following value when false
   * {'step': {'step': step, 'actual': control.value}}
   */
  public static step(stepValue: number): ValidatorFn {
    return CoreValidators.custom(((value) => value % stepValue === 0).bind(this), 'step');
  }

  /**
   * Validator that requires controls to be required given the value is an array
   */
  public static requiredArray(control: AbstractControl): ValidationErrors | null {
    return control.value.length <= 0 ? { requiredArray: true } : null;
  }

  /**
   * Validator that requires controls to be in range of minimum and maximum given the value is an array
   *
   * `@Note` This will produce the following value when false
   * {'rangeArray': {'actual': control.value, 'min': minimumValueForTheControl, 'max': maximumValueForTheControl}}
   */
  public static rangeArray(minimum: number, maximum: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      let error = { 'rangeArray': { actual: control.value.length, min: minimum, max: maximum } };
      return control.value.length < +minimum || control.value.length > +maximum ? error : null;
    };
  }

  /**
   * Validator that requires time picker controls to be greater than the provided value
   *
   * `@Note` This will produce the following value when false
   * {'minimumTime': {'min': minimumTime}}
   */
    // TO DO: for unit test
  public static minimumTime(minimumTime: [number, number]): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      let error = { minimumTime: true };
      let validTime = (Array.isArray(control.value) || control.value.length === 2) && (minimumTime.length === 2);
      let validValues = (control.value.every(value => ((value !== undefined) && (value !== null)))
                                         && minimumTime.every(value => ((value !== undefined) && (value !== null))));

      if (!validTime || !validValues) { return error; }


      let currentHour = control.value[0];
      let currentMinutes = control.value[1];
      let minHour =  minimumTime[0];
      let minMinutes = minimumTime[1];

      let minTime = (60 * minHour) + minMinutes;
      let currentTime = (60 * currentHour) + currentMinutes;

      return (currentTime < minTime) ? error : null;
    };
  }
  // TO DO: for unit test
  /**
   * Validator that requires time picker controls to be less than the provided value
   *
   * `@Note` This will produce the following value when false
   * {'maximumTime': {'max': maximumTime}}
   */
  public static maximumTime(maximumTime: [number, number]): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      let error = { maximumTime: true };
      let validTime = (Array.isArray(control.value) || control.value.length === 2) && (control.value.length === 2);
      let validValues = (control.value.every(value => ((value !== undefined) && (value !== null)))
                                         && maximumTime.every(value => ((value !== undefined) && (value !== null))));

      if (!validTime || !validValues) { return error; }

      let currentHour = control.value[0];
      let currentMinutes = control.value[1];
      let maxHour =  maximumTime[0];
      let maxMinutes = maximumTime[1];

      let maxTime = (60 * maxHour) + maxMinutes;
      let currentTime = (60 * currentHour) + currentMinutes;

      return (currentTime > maxTime) ? error : null;

    };
  }
}
