import {
  throwError,
  Observable,
  Subject
} from 'rxjs';
import {
  catchError,
  switchMap,
  takeUntil
} from 'rxjs/operators';

import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import {
  isNullOrEmpty,
  unsubscribeSafely
} from '@app/utilities';

import {
  FlatOption,
  GroupedOption
} from '../dynamic-form-field-config.interface';
import { DynamicFormFieldComponent } from '../dynamic-form-field-component.interface';
import { DynamicFieldComponentBase } from './dynamic-field-component.base';

@Component({ template: '' })
export abstract class DynamicSelectFieldComponentBase<T>
  extends DynamicFieldComponentBase
  implements DynamicFormFieldComponent, ControlValueAccessor, OnInit, OnDestroy {

  public isLoading: boolean = false;
  public hasError: boolean = false;
  public disabled: boolean = false;
  public get required(): boolean {
    return !isNullOrEmpty(this.config.validators) && this.config.validators.required;
  }

  protected destroySubject: Subject<void> = new Subject<void>();
  protected collection: T[] = [];
  private _initialized: boolean = false;

  constructor(protected _changeDetectorRef: ChangeDetectorRef) {
    super();
  }

  public ngOnInit(): void {
    this._initialize();
  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this.destroySubject);
  }

  public retrieveOptions(): void {
    this._startProcess();

    this.callService()
      .pipe(
        takeUntil(this.destroySubject),
        switchMap(() => this.callService()),
        catchError(() => {
          this._endProcess(true);
          return throwError(`${this.config.key} data retrieval failed.`);
        }))
      .subscribe((response: T[]) => {
        this.collection = response;
        this.filterOptions();
      });
  }

  public filterOptions(): void {
    if (this._initialized && !isNullOrEmpty(this.config.value)) {
      this._setValue();
    }

    this.config.options = this.filter(this.collection);

    this._endProcess();

    // Auto select during options update
    this._preselectOption();

    this._initialized = true;
  }

  protected abstract callService(): Observable<T[]>;

  protected abstract filter(collection: T[]): FlatOption[] | GroupedOption[];

  private _initialize(): void {
    if (isNullOrEmpty(this.config.options)) {
      this.retrieveOptions();
    }

    if (!isNullOrEmpty(this.config.value)) {
      this.setInitialValue(this.config.value);
    }
  }

  private _setValue(val: any = ''): void {
    this.config.value = val;
    this.valueChange(this.config.value);
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

  private _preselectOption(): void {
    if (this.config.options.length <= 0) { return; }

    if (this._tryAutoSelectSingleOption()) { return; }

    this._selectInitialValue();
  }

  private _tryAutoSelectSingleOption(): boolean {
    let isRequiredField = this.config.validators && this.config.validators.required;
    let hasSingleFlatOption = this.config.options[0].type === 'flat' && this.config.options.length === 1;
    let hasSingleGroupOption = this.config.options[0].type === 'group'
      && this.config.options.length === 1
      && this.config.options[0].options.length === 1;
    let hasSingleOption = hasSingleFlatOption || hasSingleGroupOption;

    let validForAutoSelect = isRequiredField && hasSingleOption && isNullOrEmpty(this.config.initialValue);

    if (!validForAutoSelect) { return validForAutoSelect; }

    // Autoselect
    if (hasSingleFlatOption) {
      this._setValue((this.config.options[0] as FlatOption).key);
    } else if (hasSingleGroupOption) {
      this._setValue(((this.config.options[0] as GroupedOption).options[0] as FlatOption).key);
    }

    return validForAutoSelect;
  }

  private _selectInitialValue(): void {
    if (isNullOrEmpty(this.config.initialValue)) { return; }

    // Set to default initial value if has multiple options and not yet initialized
    let hasMultipleFlatOptions = this.config.options[0].type === 'flat' && this.config.options.length >= 1;
    let hasMultipleGroupOption = this.config.options[0].type === 'group' && this.config.options[0].options.length >= 1;
    let hasMultipleOptions = hasMultipleGroupOption || hasMultipleFlatOptions;

    if (hasMultipleOptions) {
      let initialValueIsInOptionsList = false;

      if (hasMultipleFlatOptions) {
        initialValueIsInOptionsList = !isNullOrEmpty((this.config.options as FlatOption[])
        .find((opt) => opt.key === this.config.initialValue));
      } else if (hasMultipleGroupOption) {
        (this.config.options as GroupedOption[]).forEach((opt) => {
          if (initialValueIsInOptionsList) { return; }

          initialValueIsInOptionsList = !isNullOrEmpty((opt.options as FlatOption[]).find((item) =>
            item.key === this.config.initialValue));

        });
      }

      if (initialValueIsInOptionsList) { this._setValue(this.config.initialValue); }
    }
  }
}
