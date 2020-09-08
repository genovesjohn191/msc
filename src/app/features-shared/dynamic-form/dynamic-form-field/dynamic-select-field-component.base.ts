import {
  OnInit,
  ChangeDetectorRef,
  OnDestroy
} from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import {
  Subject,
  Observable,
  throwError
} from 'rxjs';
import {
  takeUntil,
  catchError
} from 'rxjs/operators';

import {
  FlatOption,
  GroupedOption
} from '../dynamic-form-field-data.interface';
import {
  isNullOrEmpty,
  unsubscribeSafely
} from '@app/utilities';
import { DynamicFormField } from '../dynamic-form-field.interface';
import { DynamicTextFieldComponentBase } from './dynamic-text-field-component.base';

export abstract class DynamicSelectFieldComponentBase<T>
  extends DynamicTextFieldComponentBase
  implements DynamicFormField, ControlValueAccessor, OnInit, OnDestroy {

  public isLoading: boolean = false;
  public hasError: boolean = false;
  public collection$: Observable<T[]>;

  protected destroySubject: Subject<void> = new Subject<void>();
  private _initialized: boolean = false;
  protected collection: T[] = [];

  constructor(private _changeDetectorRef: ChangeDetectorRef) {
    super();
  }

  public ngOnInit(): void {
    if (isNullOrEmpty(this.data.options)) {
      this.retrieveOptions();
    }
  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this.destroySubject);
  }

  public retrieveOptions(): void {
    this._startProcess();

    this.callService()
      .pipe(
        takeUntil(this.destroySubject),
        catchError(() => {
          this._endProcess(true);
          return throwError('OS retrieval failed.');
        }))
      .subscribe((collection) => {
        this.collection = collection;
        this.filterOptions();
      });
  }

  public filterOptions(): void {
    if (this._initialized && !isNullOrEmpty(this.data.value)) {
      this._resetOptions();
    }

    this.data.options = this.filter(this.collection);

    this._endProcess();
    this._initialized = true;

    // Auto select during options update
    let fileIsRequired = this.data.validators && this.data.validators.required;
    let hasSingleOption = this.data.options.length === 1;

    if (fileIsRequired && hasSingleOption) {
      if (this.data.options[0].type === 'flat') {
        this.data.value = (this.data.options[0] as FlatOption).value;
      } else {
        this.data.value = ((this.data.options[0] as GroupedOption).options[0] as FlatOption).value;
      }

      this.valueChange(this.data.value);
    }
  }

  protected abstract callService(): Observable<T[]>;

  protected abstract filter(collection: T[]): FlatOption[] | GroupedOption[];

  // Resets the options and selected value and propagate changes
  private _resetOptions(): void {
    this.data.value = '';
    this.valueChange(this.data.value);
  }

  private _startProcess(): void {
    this.isLoading = true;
    this.hasError = false;
    this._changeDetectorRef.markForCheck();
  }

  private _endProcess(hasError: boolean = false): void {
    this.isLoading = false;
    this.hasError = hasError;
    this._changeDetectorRef.markForCheck();
  }
}
