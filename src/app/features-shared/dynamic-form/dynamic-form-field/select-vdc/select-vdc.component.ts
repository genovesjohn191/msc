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

import { CommonDefinition, isNullOrEmpty } from '@app/utilities';
import {
  McsResource,
  ServiceType,
  serviceTypeText } from '@app/models';
import { McsApiService } from '@app/services';
import {
  DynamicFormFieldDataChangeEventParam,
  DynamicFormFieldOnChangeEvent,
  FlatOption,
  GroupedOption
} from '../../dynamic-form-field-config.interface';
import { DynamicSelectVdcField } from './select-vdc';
import { DynamicSelectFieldComponentBase } from '../dynamic-select-field-component.base';

@Component({
  selector: 'mcs-dff-select-vdc-field',
  templateUrl: '../shared-template/select-group.component.html',
  styleUrls: [ '../dynamic-form-field.scss' ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DynamicSelectVdcComponent),
      multi: true
    }
  ],
  host: {
    '(blur)': 'onTouched()'
  }
})
export class DynamicSelectVdcComponent extends DynamicSelectFieldComponentBase<McsResource> {
  public config: DynamicSelectVdcField;

  // Filter variables
  private _az: string = '';
  private _companyId: string = '';

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

      case 'az-change':
        this._az = params.value;
        this.retrieveOptions();
        break;
    }
  }

  protected callService(): Observable<McsResource[]> {
    let optionalHeaders = new Map<string, any>([
      [CommonDefinition.HEADER_COMPANY_ID, this._companyId]
    ]);

    return this._apiService.getResources(null, optionalHeaders).pipe(
      takeUntil(this.destroySubject),
      map((response) => {

        let returnValue = response && response.collection.filter((resource) =>
          !isNullOrEmpty(resource.availabilityZone));

        // Hide managed VDCs if enabled in config
        if (!isNullOrEmpty(returnValue) && this.config.hideManaged) {
          returnValue = returnValue.filter((resource) => resource.serviceType !== ServiceType.Managed);
        }

        // Hide self managed VDCs if enabled in config
        if (!isNullOrEmpty(returnValue) && this.config.hideSelfManaged) {
          returnValue = returnValue.filter((resource) => resource.serviceType !== ServiceType.SelfManaged);
        }

        return returnValue;
      })
    );
  }

  protected filter(collection: McsResource[]): GroupedOption[] {
    let groupedOptions: GroupedOption[] = [];

    collection.forEach((item) => {
      // Filter by Availabilty Zone
      if (!isNullOrEmpty(this._az) && item.availabilityZone !== this._az) {
        return;
      }

      let groupName = serviceTypeText[item.serviceType];
      let existingGroup = groupedOptions.find((opt) => opt.name === groupName);
      let name = `${item.availabilityZone} (${item.name})`;
      let option = {key: item.serviceId, value: name} as FlatOption;

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
  }

  public notifyForDataChange(eventName: DynamicFormFieldOnChangeEvent, dependents: string[], value?: any): void {
    this.dataChange.emit({
      value: this.collection.find((item) => item.name === value),
      eventName: eventName,
      dependents: dependents
    });
  }
}
