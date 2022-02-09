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
import {
  Observable,
  of
} from 'rxjs';
import {
  map,
  takeUntil
} from 'rxjs/operators';

import {
  CommonDefinition,
  isNullOrEmpty
} from '@app/utilities';
import {
  McsObjectCrispObject,
  McsObjectQueryParams,
  ProductType
} from '@app/models';
import { McsApiService } from '@app/services';
import {
  DynamicSelectChipsFieldComponentBase,
  DynamicSelectChipsValue
} from '../dynamic-select-chips-field-component.base';
import { DynamicSelectChipsServiceField } from './select-chips-service';
import {
  DynamicFormFieldDataChangeEventParam,
  DynamicFormFieldOnChangeEvent,
  FlatOption,
  GroupedOption
} from '../../dynamic-form-field-config.interface';

@Component({
  selector: 'mcs-dff-select-chips-service-field',
  templateUrl: '../shared-template/select-chips-group.component.html',
  styleUrls: [
    '../dynamic-form-field.scss',
    '../shared-template/select-chips.component.scss'
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DynamicSelectChipsServiceComponent),
      multi: true
    }
  ],
  host: {
    '(blur)': 'onTouched()'
  }
})
export class DynamicSelectChipsServiceComponent extends DynamicSelectChipsFieldComponentBase<McsObjectCrispObject>{
  @ViewChild('valueInput') valueInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto') matAutocomplete: MatAutocomplete;

  public config: DynamicSelectChipsServiceField;
  private _validProductTypes: string[] = [
    ProductType[ProductType.VirtualCrossConnect],
    ProductType[ProductType.FirewallVlan],
    ProductType[ProductType.DataCentresCrossConnect],
    ProductType[ProductType.HostingInternetPort],
    ProductType[ProductType.Internet],
  ];

  // Filter variables
  private _companyId: string = '';

  public constructor(
    private _apiService: McsApiService,
    _changeDetectorRef: ChangeDetectorRef
  ) {
    super(_changeDetectorRef);
  }

  public add(event: MatChipInputEvent): void {
    // Ensure the storage array is instantiated
    if (isNullOrEmpty(this.config.value)) { this.config.value = []; }

    const input = event.input;
    const value = event.value;

    // Add our custom value to the array
    let validCustomInput = this.config.allowCustomInput && !isNullOrEmpty(value?.trim())
      && CommonDefinition.REGEX_DUMMY_SERVICE_ID_PATTERN.test(value);
    if (validCustomInput) {
      this._tryAddChip({
        value: value.trim(),
        label: value.trim()
      });
    }

    // Clean up and notify
    if (input) { input.value = ''; }
    this.inputCtrl.setValue('');
    this.valueChange(this.config.value);
  }

  public selected(event: MatAutocompleteSelectedEvent): void {
    // Ensure the storage array is instantiated
    if (isNullOrEmpty(this.config.value)) { this.config.value = []; }
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
    switch (params.eventName) {

      case 'company-change':
        let convertibleToIntId = !isNaN(+params.value);
        this._companyId = convertibleToIntId ? params.value : null;
        this.retrieveOptions();
        break;
    }
  }

  protected callService(): Observable<McsObjectCrispObject[]> {
    return of([]);
  }

  protected filter(collection: McsObjectCrispObject[]): GroupedOption[] {
    if (!isNullOrEmpty(this.config.initialValue)) {
      // Force the control to reselect the initial value
      this.writeValue(this.config.initialValue);
      // Force the form to check the validty of the control
      this.valueChange(this.config.initialValue);
    }
    return [];
  }

  public search(selectedOption: McsObjectCrispObject | string): Observable<GroupedOption[]> {
    if(isNullOrEmpty(selectedOption)) { return of([]); }
    if (typeof selectedOption === 'object') {
      return of(this.config.options.filter(option => option.name?.indexOf(option.name) === 0));
    }

    let queryParam = new McsObjectQueryParams();
    queryParam.keyword = selectedOption;
    queryParam.pageSize = 10;
    queryParam.productType = this._validProductTypes.join();
    if(!isNullOrEmpty(this._companyId)) { queryParam.companyId = this._companyId; }

    return this._apiService.getCrispObjects(queryParam)
    .pipe(
      takeUntil(this.destroySubject),
      map((response) => {
        let groupedOptions: GroupedOption[] = [];

        // Remove duplicates based on service id and object type
        let deduplicatedList = response.collection.filter((e, i) => {
          return response.collection.findIndex((x) => {
          return x.serviceId === e.serviceId && x.objectType === e.objectType;}) === i;
        });

        deduplicatedList.forEach((item) => {
          let groupName = item.objectType.toLocaleString();
          let existingGroup = groupedOptions.find((opt) => opt.name === groupName);
          let key = item.serviceId;
          let value = item.serviceId;
          let option = { key, value } as FlatOption;

          if (existingGroup) {
            // Add option to existing group
            existingGroup.options.push(option);
          } else {
            // Add option to new group
            groupedOptions.push({
              type: 'group',
              name: groupName,
              options: [option]
            });
          }
        });

        return groupedOptions;
      }));
  }

  public notifyForDataChange(eventName: DynamicFormFieldOnChangeEvent, dependents: string[], value?: any): void {
    let singleValue: McsObjectCrispObject;
    let multipleValue: McsObjectCrispObject[] = [];
    if (!isNullOrEmpty(value)) {
      if (this.config.maxItems === 1) {
        singleValue = this.collection.find((item) => item.serviceId === value[0].value);
      } else {
        value.forEach((item) => {
          multipleValue.push(item.value);
        });
      }
    }
    this.dataChange.emit({
      value: this.config.maxItems === 1 ? singleValue : multipleValue,
      eventName,
      dependents
    });
  }

  private _tryAddChip(chip: DynamicSelectChipsValue): void {
    let isUnique = this.config.value.findIndex(val => val.value.toLowerCase() === chip.value.toLowerCase()) < 0;
    if (!this.config.allowDuplicates && !isUnique) {
      return;
    }

    let validToReplaceValue = this._isItemLimitReached(this.config.value) && Math.trunc(this.config.maxItems) === 1;
    if (validToReplaceValue) {
      // This allows auto replace of value if allowed max items is 1
      this.config.value = [];
    }

    if (!this._isItemLimitReached(this.config.value)) {
      this.config.value.push(chip);
    }
  }

  private _isItemLimitReached(items: DynamicSelectChipsValue[]): boolean {
    return items.length >= Math.trunc(this.config.maxItems) && this.config.maxItems > 0;
  }
}
