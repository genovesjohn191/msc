import {
  Component,
  forwardRef,
  ViewChild,
  ElementRef,
} from '@angular/core';
import {
  MatAutocomplete,
  MatAutocompleteSelectedEvent
} from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
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
import { DynamicSelectChipsFieldComponentBase } from '../dynamic-select-chips-field-component.base';
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

  constructor(private _apiService: McsApiService) {
    super();
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

    collection.forEach((item) => {
      if (this._exluded(item)) { return; }

      let value = item.name;
      if (item.serviceId) { value += ` (${item.serviceId})`; }

      options.push({ type: 'flat', key: item.id, value });
    });

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
