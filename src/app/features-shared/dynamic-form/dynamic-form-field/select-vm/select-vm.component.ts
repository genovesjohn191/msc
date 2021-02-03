import {
  Component,
  forwardRef,
  ChangeDetectorRef
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { Observable } from 'rxjs';
import {
  takeUntil,
  map
} from 'rxjs/operators';

import {
  CommonDefinition,
  isNullOrEmpty
} from '@app/utilities';
import {
  McsQueryParam,
  McsServer,
  serviceTypeText
} from '@app/models';
import { McsApiService } from '@app/services';
import {
  DynamicFormFieldDataChangeEventParam,
  FlatOption,
  GroupedOption
} from '../../dynamic-form-field-config.interface';
import { DynamicSelectVmField } from './select-vm';
import { DynamicSelectFieldComponentBase } from '../dynamic-select-field-component.base';


@Component({
  selector: 'mcs-dff-select-vm-field',
  templateUrl: '../shared-template/select-group.component.html',
  styleUrls: [ '../dynamic-form-field.scss' ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DynamicSelectVmComponent),
      multi: true
    }
  ],
  host: {
    '(blur)': 'onTouched()'
  }
})
export class DynamicSelectVmComponent extends DynamicSelectFieldComponentBase<McsServer> {
  public config: DynamicSelectVmField;

  // Filter variables
  private _companyId: string = '';
  private _serviceId: string = '';

  private _serviceIdMapping: Map<string, string> = new Map<string, string>();

  constructor(
    private _apiService: McsApiService,
    _changeDetectorRef: ChangeDetectorRef
  ) {
    super(_changeDetectorRef);
  }

  public onFormDataChange(params: DynamicFormFieldDataChangeEventParam) {
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

  // Override function to allow field to map with service ID
  public writeValue(obj: any): void {
    if (this._serviceIdMapping.has(obj)) {
      obj = this._serviceIdMapping.get(obj);
    }

    if (!isNullOrEmpty(obj)) {
      this.config.value = obj;
    }
  }

  protected callService(): Observable<McsServer[]> {
    let optionalHeaders = new Map<string, any>([
      [CommonDefinition.HEADER_COMPANY_ID, this._companyId]
    ]);

    let param = new McsQueryParam();

    return this._apiService.getServers(param, optionalHeaders).pipe(
      takeUntil(this.destroySubject),
      map((response) => {
        return response && response.collection;
      })
    );
  }

  protected filter(collection: McsServer[]): GroupedOption[] {
    let groupedOptions: GroupedOption[] = [];
    this._serviceIdMapping.clear();

    collection.forEach((item) => {
     if (this._exluded(item)) { return; }

      let groupName = serviceTypeText[item.serviceType];

      // Build a service ID map so we can map with service IDs to correct key when initializing the value
      let uniqueNonEmptyServiceId = !isNullOrEmpty(item.serviceId) && !this._serviceIdMapping.has(item.serviceId);
      if (uniqueNonEmptyServiceId) {
        this._serviceIdMapping.set(item.serviceId, item.id);
      }

      let existingGroup = groupedOptions.find((opt) => opt.name === groupName);
      let value = item.name;
      if (item.serviceId) { value += ` (${item.serviceId})`; }

      let option = { key: item.id, value } as FlatOption;

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

    let initialValueIsValidServiceId = this._serviceIdMapping.has(this.config.initialValue);
    if (initialValueIsValidServiceId) {
      // Force the control to reselect the initial value
      this.writeValue(this.config.initialValue);
      // Force the form to check the validty of the control
      this.valueChange(this.config.initialValue);
    }

    return groupedOptions;
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
