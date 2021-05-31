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
  McsQueryParam,
  McsTerraformModule,
  McsTerraformTag
} from '@app/models';
import { McsApiService } from '@app/services';
import {
  DynamicSelectChipsFieldComponentBase,
  DynamicSelectChipsValue
} from '../dynamic-select-chips-field-component.base';
import {
  DynamicFormFieldDataChangeEventParam,
  DynamicFormFieldOnChangeEvent,
  FlatOption,
  GroupedOption
} from '../../dynamic-form-field-config.interface';
import { DynamicSelectChipsTerraformModuleField } from './select-chips-terraform-module';
import { TerraformModuleType } from '../select-terraform-module-type/select-terraform-module-type.component';

const groupMapping: Map<string, string> = new Map([
  ['TRM','Resource Modules'],
  ['TSM','Solution Modules'],
  ['Custom','Customer-specific modules'],
]);

@Component({
  selector: 'mcs-dff-select-chips-terraform-module-field',
  templateUrl: '../shared-template/select-chips-group.component.html',
  styleUrls: [
    '../dynamic-form-field.scss',
    '../shared-template/select-chips.component.scss'
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DynamicSelectChipsTerraformModuleComponent),
      multi: true
    }
  ],
  host: {
    '(blur)': 'onTouched()'
  }
})
export class DynamicSelectChipsTerraformModuleComponent extends DynamicSelectChipsFieldComponentBase<McsTerraformModule> {
  @ViewChild('valueInput') valueInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto') matAutocomplete: MatAutocomplete;

  public config: DynamicSelectChipsTerraformModuleField;

  private _companyId: string = '';

  private _slugIdMapping: Map<string, string> = new Map<string, string>();
  private _searchKeyword: string = '';
  private _moduleType: TerraformModuleType = '';

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
        this.retrieveOptions();
        break;

      case 'terraform-module-type-change':
        this._moduleType = params.value;
        this.filterOptions();
        break;
    }
  }

  protected callService(): Observable<McsTerraformModule[]> {
    if (isNullOrEmpty(this._companyId)) {
      return of([]);
    }

    let optionalHeaders = new Map<string, any>([
      [CommonDefinition.HEADER_COMPANY_ID, this._companyId]
    ]);

    let param = new McsQueryParam();
    param.pageSize = 2000;

    return this._apiService.getTerraformModules(param, optionalHeaders)
    .pipe(
      takeUntil(this.destroySubject),
      map((response) => response && response.collection));
  }

  protected filter(collection: McsTerraformModule[]): GroupedOption[] {
    if (isNullOrEmpty(this._moduleType)) {
      return [];
    }

    let groupedOptions: GroupedOption[] = [];
    let otherOptions: FlatOption[] = [];
    this._slugIdMapping.clear();

    collection.forEach((item) => {
      if (this._exluded(item)) { return; }

      // Build a slug ID map so we can map with service IDs to correct key when initializing the value
      let uniqueNonEmptyServiceId = !isNullOrEmpty(item.slugId) && !this._slugIdMapping.has(item.slugId);
      if (uniqueNonEmptyServiceId) {
        this._slugIdMapping.set(item.slugId, item.id);
      }

      let groupName = item.categoryName;
      let existingGroup = groupedOptions.find((opt) => opt.name === groupName);

      let key = this.config.useSlugIdAsKey ? item.slugId : item.id;
      let value = item.friendlyName ? item.friendlyName : item.name;

      let option = { key, value } as FlatOption;

      // Create separate group for Other
      let others = isNullOrEmpty(item.categoryName) || item.categoryName.toLocaleLowerCase().trim() === 'other';
      if (others) {
        otherOptions.push(option)
        return;
      }

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

    // Add Other at the end
    if (!isNullOrEmpty(otherOptions)) {
      groupedOptions.push({
        type: 'group',
        name: 'Other',
        options: otherOptions
      });
    }

    if (!isNullOrEmpty(this.config.initialValue)) {
      // Force the control to reselect the initial value
      this.writeValue(this.config.initialValue);
      // Force the form to check the validty of the control
      this.valueChange(this.config.initialValue);
    }
    return groupedOptions;
  }

  public search(selectedOption: McsTerraformModule | string): Observable<GroupedOption[]> {
    if (typeof selectedOption === 'object') {
      return of(this.config.options.filter(option => option.name?.indexOf(option.name) === 0));
    }

    this._searchKeyword = selectedOption.toLowerCase();
    return of(this.filter(this.collection));
  }

  public notifyForDataChange(eventName: DynamicFormFieldOnChangeEvent, dependents: string[], value?: any): void {
    let singleValue: McsTerraformModule;
    let multipleValue: McsTerraformModule[] = [];
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

  private _exluded(item: McsTerraformModule): boolean {
    // Filter no slug ID if it is used as key
    if (this.config.useSlugIdAsKey && isNullOrEmpty(item.slugId)) {
      return true;
    }

    // Filter by module types
    let itemModuleType = groupMapping.has(item.projectKey) ? item.projectKey : 'Custom';
    if (!isNullOrEmpty(this._moduleType)
    && this._moduleType.toLocaleLowerCase().trim() !== itemModuleType.toLocaleLowerCase().trim()) {
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
