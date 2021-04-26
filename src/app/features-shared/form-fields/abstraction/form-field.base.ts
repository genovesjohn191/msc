import { Subject } from 'rxjs';
import {
  take,
  takeUntil,
  tap
} from 'rxjs/operators';

import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostBinding,
  HostListener,
  Injector,
  Input,
  NgZone,
  Renderer2,
  ViewChild
} from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  FormControl,
  NgControl,
  ValidatorFn
} from '@angular/forms';
import {
  isNullOrEmpty,
  isNullOrUndefined,
  McsSizeType
} from '@app/utilities';
import { TranslateService } from '@ngx-translate/core';

import { FieldErrorMessageDirective } from '../field-directives/field-error-message.directive';
import { IFormField } from './form-field.interface';

@Component({ template: '' })
export abstract class FormFieldBaseComponent2<TValue>
  implements IFormField, ControlValueAccessor {

  @Input()
  public id: string;

  @Input()
  public set size(value: McsSizeType) {
    this._updateFormControlSize(value);
    this._oldSize = value;
  }

  @Input()
  public set disabledElement(value: boolean) {
    if (this._disabledElement === value) { return; }
    this._disabledElement = value;

    if (!isNullOrEmpty(this.ngControl?.control)) {
      this._disabledElement ?
        this.ngControl.control.disable() :
        this.ngControl.control.enable();
    }
  }
  public get disabledElement(): boolean { return this._disabledElement; }

  @Input()
  public label: string;

  @Input()
  public includeNone: boolean;

  // The value returns from associated control
  public get value(): TValue { return this.ngControl?.value; }

  @ViewChild(FieldErrorMessageDirective)
  public errorMessageTemplate: FieldErrorMessageDirective<any>;

  public readonly translate: TranslateService;
  public readonly renderer: Renderer2;
  public readonly changeDetectorRef: ChangeDetectorRef;
  public readonly elementRef: ElementRef<HTMLElement>;
  public readonly ngControl: NgControl;
  public readonly ngZone: NgZone;

  protected destroySubject = new Subject<void>();

  private _disabledElement: boolean;
  private _oldSize: McsSizeType;
  private _customControls: Array<FormControl>;
  private _customValidators: Array<ValidatorFn>;

  constructor(protected injector: Injector) {
    this.translate = injector.get(TranslateService);
    this.renderer = injector.get(Renderer2);
    this.changeDetectorRef = injector.get(ChangeDetectorRef);
    this.elementRef = injector.get(ElementRef);
    this.ngControl = injector.get(NgControl);
    this.ngZone = injector.get(NgZone);

    if (!isNullOrEmpty(this.ngControl)) {
      this.ngControl.valueAccessor = this;
    }
  }

  protected _onChange = (_value: TValue) => { };
  protected _onTouched = () => { };

  public get displayedErrorMessage(): string {
    return this.errorMessageTemplate?.errorMessage || '';
  }

  public get displayedLabel(): string {
    return this.hasRequiredValidator ?
      `${this.label} *` : this.label;
  }

  public get hasFormControl(): boolean {
    return !isNullOrEmpty(this.ngControl?.control);
  }

  public get hasRequiredValidator(): boolean {
    if (isNullOrEmpty(this.ngControl?.control?.validator)) { return false; }

    let validator = this.ngControl.control.validator({} as AbstractControl);
    return validator && validator.required;
  }

  @HostBinding('attr.full-width')
  public get fullWidth(): boolean { return true; }

  @HostListener('focusout')
  public onFocusOut(): void {
    if (!isNullOrEmpty(this.errorMessageTemplate)) {
      this.errorMessageTemplate.notifyViewUpdate();
    }
  }

  public writeValue(value: TValue): void {
    this._onChange(value);
  }

  public registerOnChange(fn: (value: TValue) => void): void {
    this._onChange = fn;

    this.ngControl?.valueChanges.pipe(
      takeUntil(this.destroySubject),
      tap(() => this.changeDetectorRef.markForCheck())
    ).subscribe();

    // We need to update the form control validators here since ngOnInit does not yet
    // obtain the registered validators.
    this._updateFormControlValidators();
  }

  public registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
    this._forwardNgControlStateToCustom();
  }

  public setDisabledState(isDisabled: boolean): void {
    this._disabledElement = isDisabled;
  }

  private _forwardNgControlStateToCustom(): void {
    if (isNullOrEmpty(this.ngControl)) { return; }

    let oldValue = this.ngControl.control.touched;
    Object.defineProperty(this.ngControl.control, 'touched', {
      get() { return oldValue; },
      set: (newValue: boolean) => {
        oldValue = newValue;

        this._customControls?.forEach(customControl => {
          newValue ?
            customControl.markAsTouched() :
            customControl.markAsUntouched();
        });

        this.changeDetectorRef.markForCheck();
        if (!isNullOrEmpty(this.errorMessageTemplate)) {
          this.errorMessageTemplate.notifyViewUpdate();
        }
      }
    });
  }

  private _updateFormControlSize(newSize: McsSizeType): void {
    let hostElement = this.elementRef.nativeElement;
    if (isNullOrUndefined(hostElement)) { return; }

    this.ngZone.onStable.pipe(
      take(1),
      tap(() => {
        this._updateAssociatedFormFieldSize(hostElement, newSize);
      })
    ).subscribe();
  }

  private _updateAssociatedFormFieldSize(
    hostElement: HTMLElement,
    newSize: McsSizeType
  ): void {
    let formFields = hostElement.querySelectorAll('mat-form-field');
    if (isNullOrEmpty(formFields)) { return; }

    formFields.forEach(formField => {
      let oldClassSize = `mcs-form-field-${this._oldSize}`;
      let newClassSize = `mcs-form-field-${newSize}`;

      let hasOldClassSize = formField.classList.contains(oldClassSize);
      if (hasOldClassSize) {
        formField.classList.replace(oldClassSize, newClassSize);
        return;
      }
      formField.classList.add(newClassSize);
    });
  }

  private _updateFormControlValidators(): void {
    if (isNullOrEmpty(this._customValidators)) { return; }

    let existingValidators = this.ngControl?.control.validator;
    !isNullOrUndefined(existingValidators) ?
      this.ngControl.control.setValidators([
        ...this._customValidators,
        existingValidators
      ]) :
      this.ngControl.control.setValidators([
        ...this._customValidators
      ]);

    this.ngControl.control.updateValueAndValidity();
  }
}
