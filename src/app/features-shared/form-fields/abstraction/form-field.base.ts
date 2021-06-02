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
  IJsonObject,
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
    if (this._size === value) { return; }
    this._size = value;
    this._updateFormControlState();
  }

  @Input()
  public set readonlyElement(value: boolean) {
    if (this._readonlyElement === value) { return; }
    this._readonlyElement = value;
    this._updateFormControlState();
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

  @Input()
  public interpolations: IJsonObject;

  @ViewChild(FieldErrorMessageDirective)
  public errorMessageTemplate: FieldErrorMessageDirective<any>;

  // The value returns from associated control
  public get value(): TValue { return this.ngControl?.value; }

  public readonly translate: TranslateService;
  public readonly renderer: Renderer2;
  public readonly changeDetectorRef: ChangeDetectorRef;
  public readonly elementRef: ElementRef<HTMLElement>;
  public readonly ngControl: NgControl;
  public readonly ngZone: NgZone;

  protected destroySubject = new Subject<void>();

  private _size: McsSizeType;
  private _disabledElement: boolean;
  private _readonlyElement: boolean;
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
    if (isNullOrEmpty(this.label)) { return null; }

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
    this._updateMessageInterpolations();
  }

  public registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
    this._forwardNgControlStateToCustom();
  }

  public setDisabledState(isDisabled: boolean): void {
    this._disabledElement = isDisabled;
  }

  public registerCustomControls(...controls: FormControl[]): void {
    this._customControls = controls;
  }

  public registerCustomValidators(...validatorFn: ValidatorFn[]): void {
    this._customValidators = validatorFn;
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

  private _updateFormControlState(): void {
    let hostElement = this.elementRef.nativeElement;
    if (isNullOrUndefined(hostElement)) { return; }

    this.ngZone.onStable.pipe(
      take(1),
      tap(() => {
        let formFields = this._getFormFieldElements(hostElement);
        if (isNullOrEmpty(formFields)) { return; }

        this._updateAssociatedFormFieldSize(formFields);
        this._updateAssociatedFormFieldReadonlyState(formFields);
      })
    ).subscribe();
  }

  private _getFormFieldElements(hostElement: HTMLElement): NodeListOf<Element> {
    return hostElement.querySelectorAll('mat-form-field');
  }

  private _updateAssociatedFormFieldReadonlyState(formFields: NodeListOf<Element>): void {
    let readonlyClass = `mcs-form-field-readonly`;

    formFields.forEach(formField => {
      let hasOldSize = formField.classList.contains(readonlyClass);
      if (hasOldSize && !this._readonlyElement) {
        formField.classList.remove(readonlyClass);
        return;
      }
      if (!this._readonlyElement) { return; }
      formField.classList.add(readonlyClass);
    });
  }

  private _updateAssociatedFormFieldSize(formFields: NodeListOf<Element>): void {
    let formFieldSizeClass = `mcs-form-field-size`;

    formFields.forEach(formField => {
      let hasOldSize = formField.classList.contains(formFieldSizeClass);
      if (hasOldSize) {
        formField.classList.replace(formFieldSizeClass, this._size);
        return;
      }
      formField.classList.add(`${formFieldSizeClass}-${this._size}`);
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

  private _updateMessageInterpolations(): void {
    this.ngZone.onStable.pipe(
      take(1),
      tap(() => {
        this.errorMessageTemplate?.registerInterpolations(this.interpolations);
      })
    ).subscribe();
  }
}
