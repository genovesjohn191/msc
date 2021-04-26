import {
  merge,
  Subject
} from 'rxjs';
import {
  takeUntil,
  tap
} from 'rxjs/operators';

import {
  AfterViewInit,
  ChangeDetectorRef,
  Directive,
  Injector,
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
  unsubscribeSafely
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

  constructor(
    private _injector: Injector,
    private _changeDetectorRef: ChangeDetectorRef,
    private _translateService: TranslateService
  ) { }

  public ngAfterViewInit() {
    let container = this._injector.get(MatFormField);
    this.controlRef = container._control as any;

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

  private _onUpdateError(state: any): void {
    if (isNullOrEmpty(state) || state === 'VALID') { return; }

    let formControl = this.controlRef.ngControl.control;
    let firstError = this._getFirstErrorProperty(formControl);

    // It means the provided validator is custom
    if (firstError.split('.')?.length > 1) {
      this._errorMessage = this._translateService.instant(firstError);
      this._changeDetectorRef.markForCheck();
      return;
    }

    // This will be validators that are currently describe
    // in angular. Example the provided is Validator.required
    // the label prefix should be defined to separate the message
    // in each dynamic form field
    if (!isNullOrEmpty(this.labelPrefix)) {
      firstError = firstError?.charAt(0).toUpperCase() + firstError.slice(1);
    }

    this._errorMessage = this._translateService.instant(`message.${this.labelPrefix}${firstError}`);
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
    merge(
      this.controlRef.ngControl.statusChanges,
      this._notifyViewUpdateChange
    ).pipe(
      takeUntil(this._destroySubject),
      tap(() => this._onUpdateError(this.controlRef.ngControl.status))
    ).subscribe();
  }
}