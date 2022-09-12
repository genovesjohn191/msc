import {
  BehaviorSubject,
  Observable
} from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  shareReplay,
  takeUntil,
  tap
} from 'rxjs/operators';

import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostBinding,
  Injector,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { McsOption } from '@app/models';
import {
  convertRawObjectToString,
  isNullOrEmpty,
  isNullOrUndefined,
  DataProcess
} from '@app/utilities';

import { IFormFieldCustomizable } from '../abstraction/form-field-customizable.interface';
import { FormFieldBaseComponent2 } from '../abstraction/form-field.base';
import { IFieldAutocomplete } from './field-autocomplete';
import {
  FieldAutocompleteScrollDirective,
  IAutoCompleteScrollEvent
} from './field-autocomplete-scroll.directive';
import { FieldAutocompleteDatasource } from './field-autocomplete.datasource';

@Component({
  selector: 'mcs-field-autocomplete',
  templateUrl: './field-autocomplete.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FieldAutocompleteComponent<TValue>
  extends FormFieldBaseComponent2<TValue>
  implements IFieldAutocomplete, IFormFieldCustomizable, OnInit, OnDestroy {

  @Input()
  public multiple: boolean;

  @Input()
  public dataSource: FieldAutocompleteDatasource;

  @Output()
  public optionsChange = new EventEmitter<McsOption[]>();

  public fcInputCtrl = new FormControl();
  public dataProcess: DataProcess<any>;
  public optionItems$: Observable<McsOption[]>;

  private _optionItemsChange = new BehaviorSubject<McsOption[]>(null);

  constructor(
    _injector: Injector
  ) {
    super(_injector);
    this.dataProcess = new DataProcess();
    this.registerCustomControls(this.fcInputCtrl);
  }

  @HostBinding('class')
  public get hostClass(): string | null {
    return convertRawObjectToString({
      'mcs-field-autocomplete': true
    });
  }

  @ViewChild('scrollRef', { static: false })
  private _scrollRef: FieldAutocompleteScrollDirective;

  public ngOnInit(): void {
    this._subscribeToOptionItems();

    this.updateValidators();
    this.subscribeToFormValueChange();
    this.propagateFormValueChange();
  }

  public ngOnDestroy(): void {
    this.dispose();
  }

  public displayFn(value: any): string {
    return (this._optionItemsChange.getValue() || [])
      ?.find(optionItem => optionItem.value === value)
      ?.text || '';
  }

  public updateValidators(): void {
    // Noop if we just need to update custom validators.
  }

  public subscribeToFormValueChange(): void {
    this.outsideFormValueChanges().pipe(
      takeUntil(this.destroySubject),
      tap(() => {
        let formValue = this.ngControl?.control?.value;
        this.fcInputCtrl.setValue(formValue);
      })
    ).subscribe();
  }

  public propagateFormValueChange(): void {
    // Noop if we need to provide our own custom setting of data
  }

  public onOptionSelected(data: MatAutocompleteSelectedEvent): void {
    if (isNullOrUndefined(data)) { return; }
    this.propagateFormControlChanges(data.option?.value, false);
  }

  public onOptionScrolled(data: IAutoCompleteScrollEvent): void {
    if (isNullOrEmpty(data)) { return; }
    this.dataSource?.filterRecords(null, data.pageIndex);
  }

  private _subscribeToOptionItems(): void {
    this.dataProcess.setInProgress();

    this.optionItems$ = this.dataSource?.connect().pipe(
      takeUntil(this.destroySubject),
      tap(options => {
        this.dataProcess.setCompleted();
        this.optionsChange.next(options);
        this._optionItemsChange.next(options);
      }),
      shareReplay(1)
    );

    this.fcInputCtrl.valueChanges.pipe(
      takeUntil(this.destroySubject),
      debounceTime(1000),
      distinctUntilChanged(),
      tap(value => this._filterRecords(value || ''))
    ).subscribe();
  }

  private _filterRecords(keyword: string): void {
    let filterKeyword = (keyword.toLowerCase && keyword.toLowerCase()) || '';
    this.dataSource?.filterRecords(filterKeyword, 0);
    this._scrollRef?.resetPaging();

    // We need to this in order to notify the outside caller that the value is unselected.
    if (isNullOrEmpty(keyword)) {
      this.propagateFormControlChanges(null, false);
    }
  }
}
