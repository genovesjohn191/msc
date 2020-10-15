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

@Component({ template: '' })
export abstract class DynamicSelectFieldComponentBase<T>
  extends DynamicTextFieldComponentBase
  implements DynamicFormField, ControlValueAccessor, OnInit, OnDestroy {

  public isLoading: boolean = false;
  public hasError: boolean = false;

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
          return throwError('OS retrieval failed.');
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

  private _preselectOption(): void {
    let isRequiredField = this.data.validators && this.data.validators.required;
    // TODO: Need to check for grouped options too if only 1 option is available
    let hasSingleOption = this.data.options.length === 1;

    // Preselect option if has only one option and field is required
    if (isRequiredField && hasSingleOption) {
      let selectedValue: any = '';
      if (this.data.options[0].type === 'flat') {
        selectedValue = (this.data.options[0] as FlatOption).value;
      } else {
        selectedValue = ((this.data.options[0] as GroupedOption).options[0] as FlatOption).value;
      }

      this._setValue(selectedValue);
    }

    // Set to default initial value if has multiple options and not yet initialized

    let hasMultipleOptions = this.data.options.length > 1;
    if (hasMultipleOptions && !isNullOrEmpty(this.data.initialValue)) {
      let isSelectable = false;
      if (this.data.options[0].type === 'flat') {
        isSelectable = !isNullOrEmpty((this.data.options as FlatOption[]).find((opt) => opt.key === this.data.initialValue
        ));
      } else {
        (this.data.options as GroupedOption[]).forEach((opt) => {
          isSelectable = !isNullOrEmpty((opt.options as FlatOption[]).find((item) =>
            item.key === this.data.initialValue));

          if (isSelectable) {
            return;
          }
        });
      }

      if (isSelectable) {
        this._setValue(this.data.initialValue);
      }
    }
  }

  private _initialize(): void {
    if (isNullOrEmpty(this.data.options)) {
      this.retrieveOptions();
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
}
