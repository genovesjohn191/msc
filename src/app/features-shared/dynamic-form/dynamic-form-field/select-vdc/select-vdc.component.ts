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
import { DynamicSelectVdcField } from './select-vdc';
import { DynamicSelectFieldComponentBase } from '../dynamic-select-field-component.base';

@Component({
  selector: 'mcs-dff-select-vdc-field',
  templateUrl: './select-vdc.component.html',
  styleUrls: ['../dynamic-form-field.scss'],
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

  public noVdcForServiceFound: boolean = false;

  // Filter variables
  private _az: string = '';
  private _companyId: string = '';
  private _serviceId: string = '';

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
        
      case 'service-id-change':
        this._serviceId = params.value;
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
        //filter out non-VDC resources - e.g. clusters
        let returnValue = response && response.collection.filter((resource) =>
          resource.platform === PlatformType.VCloud);

        //filter out resources with an empty availabilityZone
        if (!isNullOrEmpty(returnValue)) {
          returnValue = returnValue.filter((resource) => !isNullOrEmpty(resource.availabilityZone));
        }

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

    this._setFieldState(collection);

    collection.forEach((item) => {
      if (this._exluded(item)) { return; }

      let groupName = serviceTypeText[item.serviceType];
      let existingGroup = groupedOptions.find((opt) => opt.name === groupName);
      let name = `${item.availabilityZone} (${item.name})`;
      let id = this.config.useServiceIdAsKey ? item.serviceId : item.id;
      let option = { key: id, value: name, 
        disabled: (isNullOrEmpty(this._serviceId) || !this.config.matchServiceIdInOptions ? 
          false : 
          item.serviceId != this._serviceId) 
        } as FlatOption;

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

  private _setFieldState(collection: McsResource[]) {

    if (this.config.matchServiceIdInOptions &&
      !isNullOrEmpty(this._serviceId)) {
      let matchedResources = collection.filter((item) => item.serviceId === this._serviceId)
      
      if (!matchedResources || matchedResources.length == 0) {
        this._setNoVdcForServiceError();
      }
      else {
        if (matchedResources.length == 1) {
          this.config.initialValue = this.config.useServiceIdAsKey
          ? matchedResources[0].serviceId
          : matchedResources[0].id;
  
          this.disabled = true;
          this._changeDetectorRef.markForCheck();
        }
      }
    }
  }

  private _setNoVdcForServiceError(): void {
    this.noVdcForServiceFound = true;
    this._changeDetectorRef.markForCheck();
  }
}
