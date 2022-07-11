import {
  Directive,
  Input,
  ChangeDetectorRef,
  ElementRef,
  Optional,
  OnDestroy,
  OnInit
} from '@angular/core';
import {
  AbstractControl,
  FormGroupDirective,
  FormGroup
} from '@angular/forms';
import {
  Subject,
  Observable
} from 'rxjs';
import {
  McsUniqueId,
  McsFormGroupService
} from '@app/core';
import {
  isNullOrEmpty,
  getSafeProperty,
  unsubscribeSafely
} from '@app/utilities';

@Directive({
  selector: 'form[mcsFormGroup]',
  host: {
    'class': 'form-group-wrapper',
    '[attr.id]': 'id'
  }
})

export class McsFormGroupDirective implements OnInit, OnDestroy {
  @Input()
  public id: string = McsUniqueId.NewId('form-group');

  private _pristineStateChange = new Subject<boolean>();
  private _dirtyStateChange = new Subject<boolean>();
  private _touchedStateChange = new Subject<boolean>();

  constructor(
    private _elementRef: ElementRef<HTMLElement>,
    private _changeDetectorRef: ChangeDetectorRef,
    private _formGroupService: McsFormGroupService,
    @Optional() private _formGroup: FormGroupDirective
  ) { }

  public ngOnInit() {
    this._overrideTouchedMethod();
    this._overridePristineMethod();
    this._overrideDirtyMethod();
  }

  public ngOnDestroy() {
    unsubscribeSafely(this._pristineStateChange);
    unsubscribeSafely(this._touchedStateChange);
  }

  /**
   * Event that emits when the pristine state has been changed
   */
  public pristineStateChanges(): Observable<boolean> {
    return this._pristineStateChange.asObservable();
  }

  /**
   * Event that emits when the dirty state has been changed
   */
  public dirtyStateChanges(): Observable<boolean> {
    return this._dirtyStateChange.asObservable();
  }

  /**
   * Event that emits when the touched state has been changed
   */
  public touchedStateChanges(): Observable<boolean> {
    return this._touchedStateChange.asObservable();
  }

  /**
   * Event that emits when the value of the forms has been changed
   */
  public valueChanges(): Observable<any> {
    return this._formGroup.valueChanges;
  }

  /**
   * Event that emits when the state of the forms has been changed
   */
  public stateChanges(): Observable<any> {
    return this._formGroup.statusChanges;
  }

  /**
   * Returns the formgroup object
   */
  public get formGroup(): FormGroup<any> {
    return this._formGroup.control;
  }

  /**
   * Returns the form controls of the form group
   */
  public get formControls(): AbstractControl[] {
    let controls = getSafeProperty(this._formGroup, (obj) => obj.control.controls);
    if (isNullOrEmpty(controls)) { return undefined; }

    let controlKeys = Object.keys(controls);
    let convertedControls = controlKeys.map((key) => controls[key]);
    return convertedControls;
  }

  /**
   * Validate all the form fields/controls within the form group
   * and mark them as touched.
   */
  public validateFormControls(focusInvalidControl?: boolean): void {
    if (isNullOrEmpty(this._formGroup)) { return; }
    this._formGroupService.touchAllFormFields(this._formGroup.control);

    // Set focus to invalid element
    if (focusInvalidControl) { this.setFocusToInvalidElement(); }
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Determine whether one of the form field was dirty/modified, otherwise it will return false
   */
  public hasDirtyFormControls(): boolean {
    if (isNullOrEmpty(this._formGroup)) { return; }

    let hasDirty: boolean = false;
    this.formControls.map((formField) => {
      if (!hasDirty) {
        hasDirty = formField.dirty
          && !formField.pristine
          && formField.touched;
      }
    });
    return hasDirty;
  }

  /**
   * This will scroll to first invalid form field element
   */
  public setFocusToInvalidElement(): void {
    if (this.isValid()) { return; }
    this._formGroupService.scrollToFirstInvalidField(this._elementRef.nativeElement);
  }

  public updateValueAndValidity(): void {
    this._formGroup.form.updateValueAndValidity();
  }

  /**
   * Return true when all the form controls are valid, otherwise false
   *
   * `@Note:` All the form fields with [formControl] directive only
   * are included in the checking. Other cases of form control declaration
   * for such checking purposes are not included.
   */
  public isValid(): boolean {
    let formsAreMissing = isNullOrEmpty(this._formGroup) || isNullOrEmpty(this.formControls);
    if (formsAreMissing) { return false; }

    let hasInvalid: boolean = false;
    this.formControls.map((formField) => {
      if (!hasInvalid && formField.invalid && formField.enabled) {
        hasInvalid = formField.invalid;
      }
    });
    return !hasInvalid;
  }

  /**
   * Reset all controls from the given content
   */
  public resetAllControls(): void {
    if (isNullOrEmpty(this._formGroup)) { return; }
    this.formControls.map((formField) => {
      formField.reset();
    });
  }

  /**
   * Overrides the touched method of the form group control
   */
  private _overrideTouchedMethod(): void {
    let oldMethodAttached = this._formGroup.control.markAsTouched;
    Object.defineProperty(this._formGroup.control, 'markAsTouched', {
      value: () => {
        if (!oldMethodAttached) { oldMethodAttached.call(this); }
        this._touchedStateChange.next(this._formGroup.control.touched);
      }
    });
  }

  /**
   * Overrides the pristine method of the form group control
   */
  private _overridePristineMethod(): void {
    let oldMethodAttached = this._formGroup.control.markAsPristine;
    Object.defineProperty(this._formGroup.control, 'markAsPristine', {
      value: () => {
        if (!oldMethodAttached) { oldMethodAttached.call(this); }
        this._pristineStateChange.next(this._formGroup.control.pristine);
      }
    });
  }

  /**
   * Overrides the dirty method of the form group control
   */
  private _overrideDirtyMethod(): void {
    let oldMethodAttached = this._formGroup.control.markAsDirty;
    Object.defineProperty(this._formGroup.control, 'markAsDirty', {
      value: () => {
        if (!oldMethodAttached) { oldMethodAttached.call(this); }
        this._dirtyStateChange.next(this._formGroup.control.dirty);
      }
    });
  }
}
