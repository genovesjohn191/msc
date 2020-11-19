import {
  Component,
  forwardRef,
  ChangeDetectorRef
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { switchMap, takeUntil } from 'rxjs/operators';
import {
  of,
  Observable
} from 'rxjs';

import { McsApiService } from '@app/services';
import {
  McsResource,
  McsServerOperatingSystem
} from '@app/models';
import {
  DynamicFormFieldDataChangeEventParam,
  GroupedOption,
  FlatOption
} from '../../dynamic-form-field-data.interface';
import { DynamicSelectOsField } from './select-os';
import { DynamicSelectFieldComponentBase } from '../dynamic-select-field-component.base';
import { isNullOrEmpty } from '@app/utilities';

@Component({
  selector: 'mcs-dff-select-os-field',
  templateUrl: '../shared-template/select-group.component.html',
  styleUrls: [ '../dynamic-form-field.scss' ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DynamicSelectOsComponent),
      multi: true
    }
  ],
  host: {
    '(blur)': 'onTouched()'
  }
})
export class DynamicSelectOsComponent extends DynamicSelectFieldComponentBase<McsServerOperatingSystem> {
  public data: DynamicSelectOsField;

  // Filter variables
  private _resource: McsResource;

  private _billingCodeMapping: Map<string, string> = new Map<string, string>();

  public constructor(
    private _apiService: McsApiService,
    _changeDetectorRef: ChangeDetectorRef
  ) {
    super(_changeDetectorRef);
  }

  public onFormDataChange(params: DynamicFormFieldDataChangeEventParam): void {
    switch (params.eventName) {
      case 'resource-change':
        this._resource = params.value as McsResource;
        this.filterOptions();
    }
  }

  protected callService(): Observable<McsServerOperatingSystem[]> {
    return this._apiService.getServerOs().pipe(
      takeUntil(this.destroySubject),
      switchMap((response) => {
        return of(response && response.collection);
      })
    );
  }

  protected filter(collection: McsServerOperatingSystem[]): GroupedOption[] {
    let groupedOptions: GroupedOption[] = [];

    collection.forEach((item) => {
      // Filter by serviceType
      if (this._resource && this._resource.serviceType !== item.serviceType) {
        return;
      }

      let groupName =
        item.type === 'LIN' ? 'CentOs'
        : item.type === 'WIN' ? 'Microsoft'
        : 'Custom Template';

      // Build a billing code map so we can map billing codes to correct key when initializing the value
      let uniqueNonEmptyBillingCode = !isNullOrEmpty(item.billingCode) && !this._billingCodeMapping.has(item.billingCode);
      if (uniqueNonEmptyBillingCode) {
        this._billingCodeMapping.set(item.billingCode, item.id);
      }

      let existingGroup = groupedOptions.find((opt) => opt.name === groupName);
      let option = { key: item.id, value: item.name} as FlatOption;

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

    let initialValueIsValidBillingCode = this._billingCodeMapping.has(this.data.initialValue);
    if (initialValueIsValidBillingCode) {
      // Force the control to reselect the initial value
      this.writeValue(this.data.initialValue);
      // Force the form to check the validty of the control
      this.valueChange(this.data.initialValue);
    }

    return groupedOptions;
  }

  // Override function to allow OS field to map with billing code
  public writeValue(obj: any): void {
    if (this._billingCodeMapping.has(obj)) {
      obj = this._billingCodeMapping.get(obj);
    }

    if (!isNullOrEmpty(obj)) {
      this.data.value = obj;
    }
  }
}
