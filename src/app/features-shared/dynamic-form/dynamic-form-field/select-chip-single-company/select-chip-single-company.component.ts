import {
  Component,
  forwardRef,
  ViewChild,
  ElementRef,
  ChangeDetectorRef,
} from '@angular/core';
import {
  MatAutocomplete,
  MatAutocompleteSelectedEvent
} from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';

import { isNullOrEmpty } from '@app/utilities';
import {
  McsCompany,
  McsQueryParam
} from '@app/models';
import { McsApiService } from '@app/services';
import {
  DynamicSelectChipsFieldComponentBase,
  DynamicSelectChipsValue
} from '../dynamic-select-chips-field-component.base';
import { DynamicSelectChipSingleCompanyField } from './select-chip-single-company';
import {
  DynamicFormFieldDataChangeEventParam,
  DynamicFormFieldOnChangeEvent,
  FlatOption
} from '../../dynamic-form-field-config.interface';

@Component({
  selector: 'mcs-dff-select-chip-single-company-field',
  templateUrl: './select-chip-single-company.component.html',
  styleUrls: [
    '../dynamic-form-field.scss',
    '../shared-template/select-chips.component.scss',
    './select-chip-single-company.component.scss'
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DynamicSelectChipSingleCompanyComponent),
      multi: true
    }
  ],
  host: {
    '(blur)': 'onTouched()'
  }
})
export class DynamicSelectChipSingleCompanyComponent extends DynamicSelectChipsFieldComponentBase<McsCompany> {
  @ViewChild('valueInput') valueInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto') matAutocomplete: MatAutocomplete;

  public companyList: DynamicSelectChipsValue[] = [];
  public config: DynamicSelectChipSingleCompanyField;

  constructor(
    private _apiService: McsApiService,
    _changeDetectorRef: ChangeDetectorRef
  ) {
    super(_changeDetectorRef);
  }

  public writeValue(obj: any): void {
    let chipsValue = obj as DynamicSelectChipsValue[];
    let translatedValue: DynamicSelectChipsValue[] = [];

    if (isNullOrEmpty(chipsValue)) { return; }

    chipsValue.forEach((chip) => {
      let validChip: boolean = !isNullOrEmpty(chip.value) && !isNullOrEmpty(chip.label);
      if (validChip) {
        translatedValue.push(chip);
      }
    });

    this.config.value = chipsValue[0].value;
  }

  public add(event: MatChipInputEvent): void {
    throw new Error('Method not implemented.');
  }

  public remove(item: DynamicSelectChipsValue): void {
    const index = this.companyList.indexOf(item);

    if (index >= 0) {
      this.companyList.splice(index, 1);
    }

    this.config.value = null;
    this.valueChange(this.config.value);
  }

  public selected(event: MatAutocompleteSelectedEvent): void {
    let option = event.option.value as FlatOption;
    this._tryAddChip({
      value: option.key,
      label: option.value
    });

    // Clean up and notify
    this.valueInput.nativeElement.value = '';
    this.inputCtrl.setValue(null);
    this.valueChange(this.config.value);
  }

  public onFormDataChange(params: DynamicFormFieldDataChangeEventParam): void {
    throw new Error('Method not implemented.');
  }

  public search(selectedOption: McsCompany | string): Observable<FlatOption[]> {
    if (typeof selectedOption === 'object') {
      return of(this.config.options.filter(option => option.key.indexOf(option.key) === 0));
    }

    if (isNullOrEmpty(selectedOption)) return of([]);

    let param = new McsQueryParam();
    param.pageSize = 10;
    param.keyword = selectedOption;

    return this._apiService.getCompanies(param)
    .pipe(
      takeUntil(this.destroySubject),
      map((response) => {
        let options: FlatOption[] = [];

        response.collection.forEach((item) => {
          let key = item.id;
          let value = `${item.name} (${item.id})`;

          options.push({ type: 'flat', key, value });
        });

        return options;
      }));
  }

  public notifyForDataChange(eventName: DynamicFormFieldOnChangeEvent, dependents: string[], chipValue?: DynamicSelectChipsValue[]): void {
    this.dataChange.emit({
      value: chipValue,
      eventName,
      dependents
    });
  }

  protected callService(): Observable<McsCompany[]> {
    return of([]);
  }

  protected filter(collection: McsCompany[]): FlatOption[] {
    if (!isNullOrEmpty(this.config.initialValue)) {
      // Force the control to reselect the initial value
      this.writeValue(this.config.initialValue);
      // Force the form to check the validty of the control
      this.valueChange(this.config.initialValue);
    }
    return [];
  }

  private _tryAddChip(chip: DynamicSelectChipsValue): void {
      this.companyList.push(chip);
      this.config.value = (chip.value);
  }
}
