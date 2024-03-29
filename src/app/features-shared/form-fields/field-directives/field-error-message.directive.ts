import {
  merge,
  Subject
} from 'rxjs';
import {
  takeUntil,
  tap
} from 'rxjs/operators';

import {
  forwardRef,
  AfterViewInit,
  ChangeDetectorRef,
  Directive,
  Inject,
  Input,
  OnDestroy
} from '@angular/core';
import { AbstractControl } from '@angular/forms';
import {
  MatFormField,
  MatFormFieldControl
} from '@angular/material/form-field';
import {
  isNullOrEmpty,
  isNullOrUndefined,
  unsubscribeSafely,
  IJsonObject
} from '@app/utilities';
import { TranslateService } from '@ngx-translate/core';

@Directive({
  selector: '[mcsFieldErrorMessage]'
})
export class FieldErrorMessageDirective<TInput> implements AfterViewInit, OnDestroy {

  @Input('mcsFieldErrorMessage')
  public labelPrefix = '';

  private _errorMessage: string;
  private controlRef: MatFormFieldControl<TInput>;

  private _destroySubject = new Subject<void>();
  private _notifyViewUpdateChange = new Subject<void>();
  private _interpolations: IJsonObject;

  constructor(
    @Inject(forwardRef(() => MatFormField)) private _formFieldHost,
    private _changeDetectorRef: ChangeDetectorRef,
    private _translateService: TranslateService
  ) { }

  public ngAfterViewInit() {
    this.controlRef = this._formFieldHost._control as any;
    this._subscribeToStatusChange();
  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this._destroySubject);
  }

  public get errorMessage(): string {
    return this._errorMessage;
  }

  public notifyViewUpdate(): void {
    this._notifyViewUpdateChange.next();
  }

  public registerInterpolations(interpolations: IJsonObject): void {
    this._interpolations = interpolations;
  }

  private _onUpdateError(state: any): void {
    if (isNullOrEmpty(state) || state === 'VALID') { return; }

    let formControl = this.controlRef.ngControl.control;
    let firstError = this._getFirstErrorProperty(formControl);
    if (isNullOrUndefined(firstError)) { return; }

    // It means the provided validator is custom
    if (firstError?.split('.')?.length > 1) {
      this._errorMessage = this._translateService.instant(firstError);
      this._changeDetectorRef.markForCheck();
      return;
    }

    // This will be validators that are currently describe
    // in angular. Example the provided is Validator.required
    // the label prefix should be defined to separate the message
    // in each dynamic form field
    if (!isNullOrEmpty(this.labelPrefix)) {
      firstError = firstError?.charAt(0).toUpperCase() + firstError?.slice(1);
    }

    this._errorMessage = this._translateService.instant(
      `message.${this.labelPrefix}${firstError}`,
      this._interpolations
    );
    this._changeDetectorRef.markForCheck();
  }

  private _getFirstErrorProperty(formGroup: AbstractControl): string {
    if (isNullOrEmpty(formGroup)) { return null; }

    for (let propertyName in formGroup.errors) {
      if (formGroup.errors.hasOwnProperty(propertyName)) {
        return propertyName;
      }
    }
    return null;
  }

  private _subscribeToStatusChange(): void {
    if (!this.controlRef?.ngControl) { return; }

    merge(
      this.controlRef.ngControl.statusChanges,
      this._notifyViewUpdateChange
    ).pipe(
      takeUntil(this._destroySubject),
      tap(() => this._onUpdateError(this.controlRef.ngControl.status))
    ).subscribe();
  }
}