import {
  Directive,
  Input,
  QueryList,
  ChangeDetectorRef,
  ContentChildren,
  AfterContentInit
} from '@angular/core';
import { FormControlDirective } from '@angular/forms';
import { McsScrollDispatcherService } from '@app/core';
import { isNullOrEmpty } from '@app/utilities';

// Unique Id that generates during runtime
let nextUniqueId = 0;

@Directive({
  selector: 'form[mcsFormGroup]',
  host: {
    'class': 'form-group-wrapper',
    '[attr.id]': 'id'
  }
})

export class FormGroupDirective implements AfterContentInit {
  @Input()
  public id: string = `mcs-form-group-${nextUniqueId++}`;

  @ContentChildren(FormControlDirective, { descendants: true })
  private _formFields: QueryList<FormControlDirective>;

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _scrollDispatcher: McsScrollDispatcherService
  ) { }

  public ngAfterContentInit(): void {
    this._validateControls();
  }

  /**
   * Validate all the form fields/controls within the form group
   * and mark them as touched.
   */
  public validateFormControls(focusInvalidControl?: boolean): void {
    if (isNullOrEmpty(this._formFields)) { return; }
    this._formFields.map((formField) => {
      formField.control.markAsTouched();
    });

    // Set focus to invalid element
    if (focusInvalidControl) {
      this.setFocusToInvalidElement();
    }
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Determine whether one of the form field was dirty/modified, otherwise it will return false
   */
  public hasDirtyFormControls(): boolean {
    if (isNullOrEmpty(this._formFields)) { return; }
    let hasDirty: boolean = false;
    this._formFields.map((formField) => {
      if (!hasDirty) {
        hasDirty = formField.form.dirty && !formField.form.pristine;
      }
    });
    return hasDirty;
  }

  /**
   * This will scroll to first invalid form field element
   */
  public setFocusToInvalidElement(): void {
    if (isNullOrEmpty(this._formFields) || this.isValid()) { return; }
    let firstElementFound: boolean = false;

    this._formFields.map((formField) => {
      if (!firstElementFound && formField.form.invalid) {
        firstElementFound = true;
        let formElement = (formField.valueAccessor as any)._elementRef.nativeElement;
        this._scrollDispatcher.scrollToElement(formElement);
        formElement.focus();
      }
    });
  }

  /**
   * Return true when all the form controls are valid, otherwise false
   *
   * `@Note:` All the form fields with [formControl] directive only
   * are included in the checking. Other cases of form control declaration
   * for such checking purposes are not included.
   */
  public isValid(): boolean {
    if (isNullOrEmpty(this._formFields)) { return false; }
    let hasInvalid: boolean = false;
    this._formFields.map((formField) => {
      if (!hasInvalid && formField.form.invalid) {
        hasInvalid = formField.form.invalid;
      }
    });
    return !hasInvalid;
  }

  /**
   * Reset all controls from the given content
   */
  public resetAllControls(): void {
    if (isNullOrEmpty(this._formFields)) { return; }
    this._formFields.map((formField) => {
      formField.reset();
    });
  }

  /**
   * Validate if atleast 1 field is existing, otherwise it will throw an exception
   */
  private _validateControls(): void {
    if (isNullOrEmpty(this._formFields)) {
      throw new Error('Form field does not exist');
    }
  }
}
