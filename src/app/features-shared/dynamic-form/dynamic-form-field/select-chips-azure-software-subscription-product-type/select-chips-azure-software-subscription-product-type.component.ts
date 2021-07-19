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
import {
  map,
  takeUntil
} from 'rxjs/operators';

import { isNullOrEmpty } from '@app/utilities';
import { McsSoftwareSubscriptionProductType, McsSoftwareSubscriptionProductTypeQueryParams } from '@app/models';
import { McsApiService } from '@app/services';
import {
  DynamicSelectChipsFieldComponentBase,
  DynamicSelectChipsValue
} from '../dynamic-select-chips-field-component.base';
import {
  DynamicSelectChipsSoftwareSubscriptionProductTypeField
} from './select-chips-azure-software-subscription-product-type';
import {
  DynamicFormFieldDataChangeEventParam,
  DynamicFormFieldOnChangeEvent,
  FlatOption
} from '../../dynamic-form-field-config.interface';

@Component({
  selector: 'mcs-dff-select-chips-azure-software-subscription-product-type-tag-field',
  templateUrl: '../shared-template/select-chips.component.html',
  styleUrls: [
    '../dynamic-form-field.scss',
    '../shared-template/select-chips.component.scss'
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DynamicSelectChipsAzureSoftwareSubscriptionProductTypeComponent),
      multi: true
    }
  ],
  host: {
    '(blur)': 'onTouched()'
  }
})
export class DynamicSelectChipsAzureSoftwareSubscriptionProductTypeComponent
  extends DynamicSelectChipsFieldComponentBase<McsSoftwareSubscriptionProductType> {

  @ViewChild('valueInput') valueInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto') matAutocomplete: MatAutocomplete;

  public config: DynamicSelectChipsSoftwareSubscriptionProductTypeField;

  private _searchKeyword: string = '';
  private _skuId: string = '';
  private _productId: string = '';

  constructor(
    private _apiService: McsApiService,
    _changeDetectorRef: ChangeDetectorRef
  ) {
    super(_changeDetectorRef);
  }

  // Override function to allow field to map with service ID
  public writeValue(obj: any): void {
    let chipsValue = obj as DynamicSelectChipsValue[];
    let translatedValue: DynamicSelectChipsValue[] = [];

    if (isNullOrEmpty(chipsValue)) { return; }

    chipsValue.forEach((chip) => {
      let itemLimitReached = this._isItemLimitReached(translatedValue);
      let validChip: boolean = !isNullOrEmpty(chip.value) && !isNullOrEmpty(chip.label);

      if (itemLimitReached) {
        return;
      }

      if (validChip) {
        translatedValue.push(chip);
      } else {
        // Check if we can allow custom input after service ID search has failed
        if (this.config.allowCustomInput) {
          chip.label = chip.value;
        }

        validChip = !isNullOrEmpty(chip.value) && !isNullOrEmpty(chip.label);
        if (!itemLimitReached && validChip) {
          let isUnique = translatedValue.findIndex(item => item.value === chip.value) < 0;
          if (this.config.allowDuplicates || isUnique) {
            translatedValue.push(chip);
          }
        }
      }
    });

    this.config.value = translatedValue;
  }

  public add(event: MatChipInputEvent): void {
    // Ensure the storage array is instantiated
    if (isNullOrEmpty(this.config.value)) { this.config.value = []; }

    const input = event.input;
    const value = event.value;

    // Add our custom value to the array
    let validCustomInput = this.config.allowCustomInput && !isNullOrEmpty(value?.trim());
    if (validCustomInput) {
      this._tryAddChip({
        value: value.trim(),
        label: value.trim()
      });
    }

    // Clean up and notify
    if (input) { input.value = ''; }
    this.inputCtrl.setValue(null);
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
    this._updateBehavior();
    switch (params.eventName) {

      case 'sku-id-change':
        this._skuId = params.value;
        this.retrieveOptions();
        break;
      case 'microsoft-product-id-change':
        this._productId = params.value;
        this.retrieveOptions();
        break;
    }
  }

  protected callService(): Observable<McsSoftwareSubscriptionProductType[]> {
    let queryParam = new McsSoftwareSubscriptionProductTypeQueryParams();
    queryParam.pageIndex = 1;
    queryParam.pageSize = 500;
    queryParam.skuId = this._skuId;
    queryParam.productId = this._productId;

    return this._apiService.getSoftwareSubscriptionProductTypes(queryParam)
    .pipe(
      takeUntil(this.destroySubject),
      map((response) => response && response.collection));
  }

  protected filter(collection: McsSoftwareSubscriptionProductType[]): FlatOption[] {
    let options: FlatOption[] = [];

    collection.forEach((item) => {
      if (this._exluded(item)) { return; }

      let key = item.catalogItemId;
      let value = item.skuName;

      let option = { key, value } as FlatOption;

      options.push(option);
    });

    let initializedArtificially = options.length === 1 && !isNullOrEmpty(this._skuId) && !isNullOrEmpty(this._productId);
    if (initializedArtificially) {
      this.config.initialValue = [{
        label: options[0].value,
        value: options[0].key
      }]
    }

    if (!isNullOrEmpty(this.config.initialValue)) {
      // Force the control to reselect the initial value
      this.writeValue(this.config.initialValue);
      // Force the form to check the validty of the control
      this.valueChange(this.config.initialValue);
    }
    return options;
  }

  public search(selectedOption: DynamicFormFieldOnChangeEvent | string): Observable<FlatOption[]> {
    if (typeof selectedOption === 'object') {
      return of(this.config.options.filter(option => option.key.indexOf(option.key) === 0));
    }

    this._searchKeyword = selectedOption.toLowerCase();
    return of(this.filter(this.collection));
  }

  public notifyForDataChange(eventName: DynamicFormFieldOnChangeEvent, dependents: string[], value?: any): void {
    let singleValue: McsSoftwareSubscriptionProductType;
    let multipleValue: McsSoftwareSubscriptionProductType[] = [];
    if (!isNullOrEmpty(value)) {
      if (this.config.maxItems === 1) {
        singleValue = this.collection.find((item) => item.catalogItemId === value[0].value);
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

  private _exluded(item: McsSoftwareSubscriptionProductType): boolean {
    // Search filter
    if (!isNullOrEmpty(this._searchKeyword)) {
      let nameHasKeyword: boolean = item.skuName.toLowerCase().indexOf(this._searchKeyword) >= 0;
      let skuKeyword: boolean = item.skuId.toLowerCase().indexOf(this._searchKeyword) >= 0;
      let productIdKeyword: boolean = item.productId.toLowerCase().indexOf(this._searchKeyword) >= 0;
      if (!nameHasKeyword && !productIdKeyword && !skuKeyword) { return true; }
    }

    return false;
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

  private _updateBehavior(): void {
    this.updateReadOnlyState();
  }
}
