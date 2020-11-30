import {
  throwError,
  Observable,
  Subject
} from 'rxjs';
import {
  catchError,
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
} from '../dynamic-form-field-data.interface';
import { DynamicFormField } from '../dynamic-form-field.interface';
import { DynamicTextFieldComponentBase } from './dynamic-text-field-component.base';
import { McsReportResourceCompliance } from '@app/models';

@Component({ template: '' })
export abstract class DynamicSelectFieldComponentBase<T>
  extends DynamicTextFieldComponentBase
  implements DynamicFormField, ControlValueAccessor, OnInit, OnDestroy {

  public isLoading: boolean = false;
  public hasError: boolean = false;
  public disabled: boolean = false;
  public get required(): boolean {
    return !isNullOrEmpty(this.data.validators) && this.data.validators.required;
  }

  protected destroySubject: Subject<void> = new Subject<void>();
  protected collection: T[] = [];
  private _initialized: boolean = false;

  constructor(private _changeDetectorRef: ChangeDetectorRef) {
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
        catchError(() => {
          this._endProcess(true);
          return throwError(`${this.data.key} data retrieval failed.`);
        }))
      .subscribe((response) => {
        this.collection = response;
        this.filterOptions();
      });
  }

  public filterOptions(): void {
    if (this._initialized && !isNullOrEmpty(this.data.value)) {
      this._setValue();
    }

    this.data.options = this.filter(this.collection);

    this._endProcess();

    // Auto select during options update
    this._preselectOption();

    this._initialized = true;
  }

  protected abstract callService(): Observable<T[]>;

  protected abstract filter(collection: T[]): FlatOption[] | GroupedOption[];

  private _initialize(): void {
    if (isNullOrEmpty(this.data.options)) {
      this.retrieveOptions();
    } else if (!isNullOrEmpty(this.data.value)) {
      this.setInitialValue(this.data.value);
    }
  }

  private _setValue(val: any = ''): void {
    this.data.value = val;
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

  private _preselectOption(): void {
    if (this.data.options.length <= 0) { return; }

    if (this._tryAutoSelectSingleOption()) { return; }

    this._selectInitialValue();
  }

  private _tryAutoSelectSingleOption(): boolean {
    let isRequiredField = this.data.validators && this.data.validators.required;
    let hasSingleFlatOption = this.data.options[0].type === 'flat' && this.data.options.length === 1;
    let hasSingleGroupOption = this.data.options[0].type === 'group' && this.data.options[0].options.length === 1;
    let hasSingleOption = hasSingleFlatOption || hasSingleGroupOption;

    let validForAutoSelect = isRequiredField && hasSingleOption && isNullOrEmpty(this.data.initialValue);

    if (!validForAutoSelect) { return validForAutoSelect; }

    // Autoselect
    if (hasSingleFlatOption) {
      this._setValue((this.data.options[0] as FlatOption).key);
    } else if (hasSingleGroupOption) {
      this._setValue(((this.data.options[0] as GroupedOption).options[0] as FlatOption).key);
    }

    return validForAutoSelect;
  }

  private _selectInitialValue(): void {
    if (isNullOrEmpty(this.data.initialValue)) { return; }

    // Set to default initial value if has multiple options and not yet initialized
    let hasMultipleFlatOptions = this.data.options[0].type === 'flat' && this.data.options.length >= 1;
    let hasMultipleGroupOption = this.data.options[0].type === 'group' && this.data.options[0].options.length >= 1;
    let hasMultipleOptions = hasMultipleGroupOption || hasMultipleFlatOptions;

    if (hasMultipleOptions) {
      let initialValueIsInOptionsList = false;

      if (hasMultipleFlatOptions) {
        initialValueIsInOptionsList = !isNullOrEmpty((this.data.options as FlatOption[]).find((opt) => opt.key === this.data.initialValue
        ));
      } else if (hasMultipleGroupOption) {
        (this.data.options as GroupedOption[]).forEach((opt) => {
          if (initialValueIsInOptionsList) { return; }

          initialValueIsInOptionsList = !isNullOrEmpty((opt.options as FlatOption[]).find((item) =>
            item.key === this.data.initialValue));

        });
      }

      if (initialValueIsInOptionsList) { this._setValue(this.data.initialValue); }
    }
  }
}
