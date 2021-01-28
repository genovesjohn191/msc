import {
  Component,
  ViewChild,
  ElementRef,
  OnDestroy,
  OnInit
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
  MatAutocomplete,
  MatAutocompleteSelectedEvent
} from '@angular/material/autocomplete';
import { ControlValueAccessor, FormControl } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import {
  Observable,
  Subject,
  Subscription
} from 'rxjs';

import { catchError, map, startWith, takeUntil } from 'rxjs/operators';
import { isNullOrEmpty, unsubscribeSafely } from '@app/utilities';

import { DynamicTextFieldComponentBase } from './dynamic-text-field-component.base';
import { DynamicFormFieldDataChangeEventParam, FlatOption } from '../dynamic-form-field-config.interface';
import { throwError } from 'rxjs';
import { DynamicFormFieldComponent } from '../dynamic-form-field-component.interface';

export interface DynamicSelectChipsValue {
  value: string;
  label: string;
}

@Component({ template: '' })
export abstract class DynamicSelectChipsFieldComponentBase<T>
  extends DynamicTextFieldComponentBase
  implements DynamicFormFieldComponent, ControlValueAccessor, OnInit, OnDestroy {

  public selectable = true;
  public removable = true;
  public separatorKeysCodes: number[] = [ENTER, COMMA];
  public inputCtrl = new FormControl();
  public filteredOptions: Observable<FlatOption[]>;

  protected collection: T[] = [];
  protected destroySubject: Subject<void> = new Subject<void>();

  private currentServiceCall: Subscription;

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
    if (this.currentServiceCall) {
      this.currentServiceCall.unsubscribe();
    }

    this.currentServiceCall = this.callService()
      .pipe(
        takeUntil(this.destroySubject),
        catchError(() => {
          return throwError(`${this.config.key} data retrieval failed.`);
        }))
      .subscribe((response) => {
        this.collection = response;
        this.filterOptions();
        this.initializeFiltering();
      });
  }

  public filterOptions(): void {
    this.config.options = this.filter(this.collection);
  }

  public isString(item: any): boolean {
    return typeof item === 'string';
  }

  public abstract add(event: MatChipInputEvent): void;

  public abstract selected(event: MatAutocompleteSelectedEvent): void;

  public abstract search(selectedOption: T | string): FlatOption[];

  public abstract onFormDataChange(params: DynamicFormFieldDataChangeEventParam): void;

  protected abstract callService(): Observable<T[]>;

  protected abstract filter(collection: T[]): FlatOption[];

  protected initializeFiltering(): void {
    this.filteredOptions = this.inputCtrl.valueChanges.pipe(
      startWith(null as void),
      map((option: string | null) => this.search(option)));
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
  }
}
