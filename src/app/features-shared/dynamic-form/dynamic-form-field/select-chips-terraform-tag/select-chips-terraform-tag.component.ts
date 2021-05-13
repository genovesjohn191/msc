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

import {
  CommonDefinition,
  isNullOrEmpty
} from '@app/utilities';
import {
  McsTerraformModule,
  McsTerraformTag,
  McsTerraformTagQueryParams
} from '@app/models';
import { McsApiService } from '@app/services';
import {
  DynamicSelectChipsFieldComponentBase,
  DynamicSelectChipsValue
} from '../dynamic-select-chips-field-component.base';
import { DynamicSelectChipsTerraformTagField } from './select-chips-terraform-tag';
import {
  DynamicFormFieldDataChangeEventParam,
  DynamicFormFieldOnChangeEvent,
  FlatOption
} from '../../dynamic-form-field-config.interface';

@Component({
  selector: 'mcs-dff-select-chips-terraform-tag-field',
  templateUrl: '../shared-template/select-chips.component.html',
  styleUrls: [
    '../dynamic-form-field.scss',
    '../shared-template/select-chips.component.scss'
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DynamicSelectChipsTerraformTagComponent),
      multi: true
    }
  ],
  host: {
    '(blur)': 'onTouched()'
  }
})
export class DynamicSelectChipsTerraformTagComponent extends DynamicSelectChipsFieldComponentBase<McsTerraformTag> {
  @ViewChild('valueInput') valueInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto') matAutocomplete: MatAutocomplete;

  public config: DynamicSelectChipsTerraformTagField;

  private _companyId: string = '';
  private _terraformModule: McsTerraformModule;

  private _slugIdMapping: Map<string, string> = new Map<string, string>();
  private _searchKeyword: string = '';

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
        // Assumes value is tenant ID and search via map
        if (this._slugIdMapping.has(chip.value)) {
          chip.label = chip.value;
          chip.value = this.config.useSlugIdAsKey ? chip.value : this._slugIdMapping.get(chip.value);

        // Check if we can allow custom input after service ID search has failed
        } else if (this.config.allowCustomInput) {
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
    switch (params.eventName) {

      case 'company-change':
        this._companyId = params.value;
        this._terraformModule = null;
        this.retrieveOptions();
        break;

      case 'terraform-module-change':
        this._terraformModule = params.value as McsTerraformModule;
        this.retrieveOptions();
        break;
    }
  }

  protected callService(): Observable<McsTerraformTag[]> {
    if (isNullOrEmpty(this._companyId) || isNullOrEmpty(this._terraformModule)) {
      return of([]);
    }

    let optionalHeaders = new Map<string, any>([
      [CommonDefinition.HEADER_COMPANY_ID, this._companyId]
    ]);

    let param = new McsTerraformTagQueryParams();
    param.pageSize = 2000;
    param.moduleId = this._terraformModule.id;

    return this._apiService.getTerraformTags(param, optionalHeaders)
    .pipe(
      takeUntil(this.destroySubject),
      map((response) => response && response.collection));
  }

  protected filter(collection: McsTerraformTag[]): FlatOption[] {
    let options: FlatOption[] = [];
    this._slugIdMapping.clear();

    collection.forEach((item) => {
      if (this._exluded(item)) { return; }

      // Build a slug ID map so we can map with service IDs to correct key when initializing the value
      let uniqueNonEmptyServiceId = !isNullOrEmpty(item.slugId) && !this._slugIdMapping.has(item.slugId);
      if (uniqueNonEmptyServiceId) {
        this._slugIdMapping.set(item.slugId, item.id);
      }



      let key = this.config.useSlugIdAsKey ? item.slugId : item.id;
      let value = item.name;

      let option = { key, value } as FlatOption;

      options.push(option);
    });

    if (!isNullOrEmpty(this.config.initialValue)) {
      // Force the control to reselect the initial value
      this.writeValue(this.config.initialValue);
      // Force the form to check the validty of the control
      this.valueChange(this.config.initialValue);
    }
    return options;
  }

  public search(selectedOption: McsTerraformTag | string): Observable<FlatOption[]> {
    if (typeof selectedOption === 'object') {
      return of(this.config.options.filter(option => option.key.indexOf(option.key) === 0));
    }

    this._searchKeyword = selectedOption.toLowerCase();
    return of(this.filter(this.collection));
  }

  public notifyForDataChange(eventName: DynamicFormFieldOnChangeEvent, dependents: string[], value?: any): void {
    let singleValue: McsTerraformTag;
    let multipleValue: McsTerraformTag[] = [];
    if (!isNullOrEmpty(value)) {
      if (this.config.maxItems === 1) {
        singleValue = this.config.useSlugIdAsKey
        ? this.collection.find((item) => item.slugId === value[0].value)
        : this.collection.find((item) => item.id === value[0].value);

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

  private _exluded(item: McsTerraformTag): boolean {
    // Filter no slug ID if it is used as key
    if (this.config.useSlugIdAsKey && isNullOrEmpty(item.slugId)) {
      return true;
    }

    // Filter by module
    if (!isNullOrEmpty(this._terraformModule) && item.module !== this._terraformModule.id) {
      return true;
    }

    // Search filter
    if (!isNullOrEmpty(this._searchKeyword)) {
      let nameHasKeyword: boolean = item.name.toLowerCase().indexOf(this._searchKeyword) >= 0;
      if (!nameHasKeyword) { return true; }
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
}
