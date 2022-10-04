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
  McsResource,
  ServiceType,
  serviceTypeText,
  PlatformType,
  McsQueryParam
} from '@app/models';
import { McsApiService } from '@app/services';
import {
  DynamicFormFieldDataChangeEventParam,
  DynamicFormFieldOnChangeEvent,
  FlatOption,
  GroupedOption
} from '../../dynamic-form-field-config.interface';
import { DynamicSelectResourceField } from './select-resource';
import { DynamicSelectFieldComponentBase } from '../dynamic-select-field-component.base';

@Component({
  selector: 'mcs-dff-select-resource-field',
  templateUrl: './select-resource.component.html',
  styleUrls: ['../dynamic-form-field.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DynamicSelectResourceComponent),
      multi: true
    }
  ],
  host: {
    '(blur)': 'onTouched()'
  }
})
export class DynamicSelectResourceComponent extends DynamicSelectFieldComponentBase<McsResource> {
  public config: DynamicSelectResourceField;

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
    }
  }

  public notifyForDataChange(eventName: DynamicFormFieldOnChangeEvent, dependents: string[], value?: any): void {
    let dataValue = this.config.useServiceIdAsKey ? this.collection.find((item) => item.serviceId === value)
      : this.collection.find((item) => item.id === value);

    this.dataChange.emit({
      value: dataValue,
      eventName,
      dependents
    });
  }

  protected callService(): Observable<McsResource[]> {
    let optionalHeaders = new Map<string, any>([
      [CommonDefinition.HEADER_COMPANY_ID, this._companyId]
    ]);

    let param = new McsQueryParam();
    param.pageSize = CommonDefinition.PAGE_SIZE_MAX;

    return this._apiService.getResources(optionalHeaders, param).pipe(
      takeUntil(this.destroySubject),
      map((response) => {
        let returnValue = response && response.collection;
        if(this.config.includedPlatformTypes.length > 0){
          returnValue = returnValue.filter((resource) => this.config.includedPlatformTypes.includes(resource.platform));
        }
        return returnValue;
      })
    );
  }

  protected filter(collection: McsResource[]): GroupedOption[] {
    let groupedOptions: GroupedOption[] = [];

    collection.forEach((item) => {
      if (this._exluded(item)) { return; }

      let groupName = serviceTypeText[item.serviceType];
      let existingGroup = groupedOptions.find((opt) => opt.name === groupName);
      let name = `${item.availabilityZone} (${item.name})`;
      let id = this.config.useServiceIdAsKey ? item.serviceId : item.id;
      let option = { key: id, value: name, disabled: false } as FlatOption;

      if(this.config.disableStretched && item.isStretched) {
        option.disabled = true;
        option.hint = 'Stretched';
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

    return groupedOptions;
  }

  private _exluded(item: McsResource): boolean {
    // Filter by Availabilty Zone
    if (!isNullOrEmpty(this._az) && item.availabilityZone !== this._az) {
      return true;
    }

    return false;
  }
}
