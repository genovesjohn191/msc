import {
  Component,
  OnDestroy,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';
import {
  CdkDragDrop,
  moveItemInArray
} from '@angular/cdk/drag-drop';
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
import { MatChipInputEvent } from '@angular/material/chips';
import {
  from,
  Observable,
  of,
  Subject,
  Subscription,
  throwError
} from 'rxjs';
import {
  catchError,
  concatMap,
  debounceTime,
  delay,
  distinctUntilChanged,
  map,
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

export interface DynamicSelectChipsValue {
  value: string;
  label?: string;
}

@Component({ template: '' })
export abstract class DynamicSelectChipsFieldComponentBase<T>
  extends DynamicFieldComponentBase
  implements DynamicFormFieldComponent, ControlValueAccessor, OnInit, OnDestroy {

  public isLoading: boolean = false;
  public hasError: boolean = false;
  public selectable = true;
  public removable = true;
  public separatorKeysCodes: number[] = [ENTER, COMMA];
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
  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this.destroySubject);
  }

  public drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.config.value, event.previousIndex, event.currentIndex);
  }

  public remove(item: DynamicSelectChipsValue): void {
    const index = this.config.value.indexOf(item);

    if (index >= 0) {
      this.config.value.splice(index, 1);
    }

    this.valueChange(this.config.value);
  }

  public retrieveOptions(): void {
    this._startProcess();

    if (this.currentServiceCall) {
      this.currentServiceCall.unsubscribe();
    }

    // Reset the collections
    this.config.value = [];
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
        this.collection = response;
        this.filterOptions();
      });
  }

  public filterOptions(): void {
    if (this.initialized && !isNullOrEmpty(this.config.value)) {
      this._setValue([]);
    }

    this.config.options = this.filter(this.collection);
    this.initializeFiltering();
    this._endProcess();
  }

  public isString(item: any): boolean {
    return typeof item === 'string';
  }

  public addToChips(inputControl: any): void {
    const myArray = [1];

    from(myArray).pipe(
      concatMap( item => of(item).pipe( delay(200) ))
    ).subscribe ( timedItem => {
        if (isNullOrEmpty(inputControl.value)) return;

        this.add({
          input: inputControl,
          value: inputControl.value
        })
    });
  }

  public abstract add(event: MatChipInputEvent): void;

  public abstract selected(event: MatAutocompleteSelectedEvent): void;

  public abstract search(selectedOption: T | string): Observable<FlatOption[] | GroupedOption[]>;

  public abstract onFormDataChange(params: DynamicFormFieldDataChangeEventParam): void;

  protected abstract callService(): Observable<T[]>;

  protected abstract filter(collection: T[]): FlatOption[] | GroupedOption[];

  protected initializeFiltering(): void {
    this.filteredOptions = this.inputCtrl.valueChanges.pipe(
      startWith(null as void),
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

  private _setValue(val: any = []): void {
    this.config.value = val;
    this.valueChange(this.config.value);
  }
}
