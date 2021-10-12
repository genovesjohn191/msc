import {
  Component,
  OnDestroy,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';
import {
  COMMA,
  ENTER
} from '@angular/cdk/keycodes';
import {
  MatAutocompleteSelectedEvent
} from '@angular/material/autocomplete';
import {
  ControlValueAccessor,
  FormControl
} from '@angular/forms';
import {
  Observable,
  of,
  Subject,
  Subscription,
  throwError
} from 'rxjs';
import {
  catchError,
  debounceTime,
  startWith,
  switchMap,
  takeUntil
} from 'rxjs/operators';

import {
  isNullOrEmpty,
  unsubscribeSafely
} from '@app/utilities';
import { DynamicFieldComponentBase } from './dynamic-field-component.base';
import {
  DynamicFormFieldDataChangeEventParam,
  FlatOption,
  GroupedOption
} from '../dynamic-form-field-config.interface';
import { DynamicFormFieldComponent } from '../dynamic-form-field-component.interface';

@Component({ template: '' })
export abstract class DynamicInputAutocompleteFieldComponentBase<T>
  extends DynamicFieldComponentBase
  implements DynamicFormFieldComponent, ControlValueAccessor, OnInit, OnDestroy {

  public isLoading: boolean = false;
  public hasError: boolean = false;
  public selectable = true;
  public removable = true;
  public inputCtrl = new FormControl();
  public filteredOptions: Observable<FlatOption[] | GroupedOption[]>;

  protected collection: T[] = [];
  protected destroySubject: Subject<void> = new Subject<void>();
  protected initialized: boolean = false;

  private currentServiceCall: Subscription;

  constructor(private _changeDetectorRef: ChangeDetectorRef) {
    super();
  }

  public ngOnInit(): void {
    this._initialize();
    this.updateReadOnlyState();
  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this.destroySubject);
  }

  public retrieveOptions(): void {
    this._startProcess();

    if (this.currentServiceCall) {
      this.currentServiceCall.unsubscribe();
    }

    // Reset the collection
    this.collection = [];
    this.filteredOptions = of([]);
    if (!this.initialized) {
      // Force the control to reselect the initial value
      this.writeValue([]);
      // Force the form to check the validty of the control
      this.valueChange([]);
    }

    this.currentServiceCall = this.callService()
      .pipe(
        takeUntil(this.destroySubject),
        switchMap(() => this.callService()),
        catchError(() => {
          this._endProcess(true);
          return throwError(`${this.config.key} data retrieval failed.`);
        }))
      .subscribe((response: T[]) => {
        this._endProcess();
        this.collection = response;
        this.filterOptions();
      });
  }

  public filterOptions(): void {
    this.config.options = this.filter(this.collection);
    this.initializeFiltering();
    this._endProcess();
  }

  public updateValue(inputControl: any): void {
    this.setValue(inputControl.value);
  }

  public abstract setValue(value: string): void;

  public abstract selected(event: MatAutocompleteSelectedEvent): void;

  public abstract search(selectedOption: T | string): Observable<FlatOption[] | GroupedOption[]>;

  public abstract onFormDataChange(params: DynamicFormFieldDataChangeEventParam): void;

  protected abstract callService(): Observable<T[]>;

  protected abstract filter(collection: T[]): FlatOption[] | GroupedOption[];

  protected initializeFiltering(): void {
    this.filteredOptions = this.inputCtrl.valueChanges.pipe(
      startWith(''),
      debounceTime(500),
      switchMap((option: string | null) => this.search(option)));
  }

  private _initialize(): void {
    if (isNullOrEmpty(this.config.options)) {
      this.retrieveOptions();
    } else {
      this.initializeFiltering();
    }

    if (!isNullOrEmpty(this.config.value)) {
      this.setInitialValue(this.config.value);
    }

    this.initialized = true;
  }

  public _startProcess(): void {
    this.isLoading = true;
    this.hasError = false;
    this._changeDetectorRef.markForCheck();
  }

  public _endProcess(hasError: boolean = false): void {
    this.isLoading = false;
    this.hasError = hasError;
    this._changeDetectorRef.markForCheck();
  }
}
