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
import { NG_VALUE_ACCESSOR, RequiredValidator, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';

import {
  CommonDefinition,
  isNullOrEmpty
} from '@app/utilities';
import {
  McsQueryParam,
  McsServer
} from '@app/models';
import { McsApiService } from '@app/services';
import { DynamicSelectChipsFieldComponentBase, DynamicSelectChipsValue } from '../dynamic-select-chips-field-component.base';
import { DynamicSelectChipsVmField } from './select-chips-vm';
import {
  DynamicFormFieldDataChangeEventParam,
  FlatOption
} from '../../dynamic-form-field-config.interface';

@Component({
  selector: 'mcs-dff-select-chips-vm-field',
  templateUrl: '../shared-template/select-chips.component.html',
  styleUrls: [
    '../dynamic-form-field.scss',
    '../shared-template/select-chips.component.scss'
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DynamicSelectChipsVmComponent),
      multi: true
    }
  ],
  host: {
    '(blur)': 'onTouched()'
  }
})
export class DynamicSelectChipsVmComponent extends DynamicSelectChipsFieldComponentBase<McsServer> {
  @ViewChild('valueInput') valueInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto') matAutocomplete: MatAutocomplete;

  public config: DynamicSelectChipsVmField;

  private _companyId: string = '';
  private _serviceId: string = '';

  private _serviceIdMapping: Map<string, string> = new Map<string, string>();

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
      let validChip: boolean = !isNullOrEmpty(chip.value) && !isNullOrEmpty(chip.label);
      if (validChip) {
        translatedValue.push(chip);
      } else {
        // Assumes value is service ID and search via map
        if (this._serviceIdMapping.has(chip.value)) {
          let id = this._serviceIdMapping.get(chip.value);
          chip.label = chip.value;
          chip.value = id;

          let isUnique = translatedValue.findIndex(item => item.value === id) < 0;
          if (this.config.allowDuplicates || isUnique) {
            translatedValue.push(chip);
          }
        }
      }
    });

    this.config.value = translatedValue;
  }

  public add(event: MatChipInputEvent): void {
    event.input.value = '';
    this.inputCtrl.setValue(null);

  }

  public selected(event: MatAutocompleteSelectedEvent): void {
    // Ensure the storage array is instantiated
    if (isNullOrEmpty(this.config.value)) { this.config.value = []; }

    let option = event.option.value as FlatOption;

    let isUnique = this.config.value.findIndex(item => item.value === option.key) < 0;
    if (this.config.allowDuplicates || isUnique) {

      this.config.value.push({
        value: option.key,
        label: option.value
      });
    }

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

      case 'service-id-change':
        this._serviceId = params.value;
        this.filterOptions();
        break;
    }
  }

  protected callService(): Observable<McsServer[]> {
    // Force the control to reselect the initial value
    this.writeValue([]);
    // Force the form to check the validty of the control
    this.valueChange([]);

    let optionalHeaders = new Map<string, any>([
      [CommonDefinition.HEADER_COMPANY_ID, this._companyId]
    ]);

    let param = new McsQueryParam();
    return this._apiService.getServers(param, optionalHeaders)
    .pipe(
      takeUntil(this.destroySubject),
      map((response) => response && response.collection));
  }

  protected filter(collection: McsServer[]): FlatOption[] {
    let options: FlatOption[] = [];
    this._serviceIdMapping.clear();

    collection.forEach((item) => {
      if (this._exluded(item)) { return; }

      // Build a service ID map so we can map with service IDs to correct key when initializing the value
      let uniqueNonEmptyServiceId = !isNullOrEmpty(item.serviceId) && !this._serviceIdMapping.has(item.serviceId);
      if (uniqueNonEmptyServiceId) {
        this._serviceIdMapping.set(item.serviceId, item.id);
      }

      let value = item.name;
      if (item.serviceId) { value += ` (${item.serviceId})`; }

      options.push({ type: 'flat', key: item.id, value });
    });

    if (!isNullOrEmpty(this.config.initialValue)) {
      // Force the control to reselect the initial value
      this.writeValue(this.config.initialValue);
      // Force the form to check the validty of the control
      this.valueChange(this.config.initialValue);
    }

    return options;
  }

  public search(selectedOption: McsServer | string): FlatOption[] {
    if (typeof selectedOption === 'object') {
      return this.config.options.filter(option => option.key.indexOf(option.key) === 0);
    }

    const filterValue = selectedOption.toLowerCase();

    return this.config.options.filter(option => option.value.toLowerCase().indexOf(filterValue) >= 0);
  }

  private _exluded(item: McsServer): boolean {
    // Filter by service ID
    if (!isNullOrEmpty(this._serviceId) && item.serviceId !== this._serviceId) {
      return true;
    }

    // Filter dedicated
    if (this.config.hideDedicated && item.isDedicated) {
      return true;
    }

    // Filter Non-Dedicated
    if (this.config.hideNonDedicated && !item.isDedicated) {
      return true;
    }

    // Filter  type filter
    if (!isNullOrEmpty(this.config.allowedHardwareType) && this.config.allowedHardwareType.indexOf(item.hardware.type) < 0) {
      return true;
    }

    return false;
  }
}
