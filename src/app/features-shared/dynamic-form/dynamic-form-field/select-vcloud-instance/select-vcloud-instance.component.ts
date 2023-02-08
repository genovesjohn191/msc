import {
  Component,
  forwardRef,
  ChangeDetectorRef
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import {
  Observable,
  throwError
} from 'rxjs';
import {
  takeUntil,
  map,
  catchError
} from 'rxjs/operators';

import {
  CommonDefinition,
  compareStrings,
  isNullOrEmpty
} from '@app/utilities';
import {
  McsQueryParam,
  McsVcloudInstance,
  podAvailabilityZoneText,
  McsResource,
  PodAvailabilityZone
} from '@app/models';
import { McsApiService } from '@app/services';

import {
  DynamicFormFieldDataChangeEventParam,
  DynamicFormFieldOnChangeEvent,
  FlatOption,
  GroupedOption
} from '../../dynamic-form-field-config.interface';
import { DynamicSelectVcloudInstanceField } from './select-vcloud-instance';
import { DynamicSelectFieldComponentBase } from '../dynamic-select-field-component.base';
import { CrispAttributeNames } from '@app/features/launch-pad/workflows/workflow/core/forms/mapping-helper';

@Component({
  selector: 'mcs-dff-select-vcloud-instance-field',
  templateUrl: './select-vcloud-instance.component.html',
  styleUrls: ['../dynamic-form-field.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DynamicSelectVcloudInstanceComponent),
      multi: true
    }
  ],
  host: {
    '(blur)': 'onTouched()'
  }
})
export class DynamicSelectVcloudInstanceComponent extends DynamicSelectFieldComponentBase<McsVcloudInstance> {
  public config: DynamicSelectVcloudInstanceField;

  // Filter variables
  private _serviceId: string = '';
  private _companyId: string = '';

  private _resources: McsResource[];
  private _serviceIdExistDifferentVcloud: boolean = true;

  public serviceIdExistSameVcloud: boolean = null;
  public noMatchingServiceId: boolean;

  constructor(
    private _apiService: McsApiService,
    _changeDetectorRef: ChangeDetectorRef
  ) {
    super(_changeDetectorRef);
  }

  public onFormDataChange(params: DynamicFormFieldDataChangeEventParam) {
    switch (params.eventName) {
      case 'service-id-change':
        this._serviceId = params.value;
        this.retrieveOptions();
        break;

      case 'company-change':
        this._companyId = params.value;
        this._getResources();
        this._configureValidators();
        this.retrieveOptions();
        break;
    }
  }

  public vcloudExistInServicelsValidator(inputValue: any): boolean {
    return this._serviceIdExistDifferentVcloud;
  }

  public notifyForDataChange(eventName: DynamicFormFieldOnChangeEvent, dependents: string[], value?: any): void {

    let dataValue = this.collection.find((item) => item.id === value);
    this.serviceIdExistSameVcloud =  isNullOrEmpty(dataValue) ? null : this._validateServiceIdExistence(dataValue);
    this._serviceIdExistDifferentVcloud = this.serviceIdExistSameVcloud;
    this._changeDetectorRef.markForCheck();
    let returnValue = this.serviceIdExistSameVcloud ? dataValue :
      dataValue ? '' : null;

    this.dataChange.emit({
      value: returnValue,
      eventName,
      dependents
    });
  }

  private _validateServiceIdExistence(selectedVCloud: McsVcloudInstance): boolean {
    let serviceIdExistSameVcloud = this._resources?.find((resource) => {
      return resource.serviceId === this._serviceId && compareStrings(resource.portalUrl, selectedVCloud?.name) === 0;
    });
    if (isNullOrEmpty(serviceIdExistSameVcloud)) {
      let noMatchingServiceId = this._resources?.find((resource) => {
        return (resource.serviceId === this._serviceId) && (resource.portalUrl.toString() !== selectedVCloud?.name.toString());
      });
      if (isNullOrEmpty(noMatchingServiceId)) {
        this.noMatchingServiceId = true;
        this._changeDetectorRef.markForCheck();
        return true;
      } else {
        this.noMatchingServiceId = false;
        this._changeDetectorRef.markForCheck();
        return false;
      }
    }
    this.noMatchingServiceId = false;
    this._changeDetectorRef.markForCheck();
    return true;
  }

  protected callService(): Observable<McsVcloudInstance[]> {
    let optionalHeaders = new Map<string, any>([
      [CommonDefinition.HEADER_COMPANY_ID, this._companyId]
    ]);

    let param = new McsQueryParam();
    param.pageSize = CommonDefinition.PAGE_SIZE_MAX;

    return this._apiService.getVcloudInstances(param, optionalHeaders).pipe(
      takeUntil(this.destroySubject),
      map((response) => {
        let returnValue = response && response.collection;
        return returnValue;
      })
    );
  }

  protected filter(collection: McsVcloudInstance[]): GroupedOption[] {
    let groupedOptions: GroupedOption[] = [];

    if (collection?.length === 0) { return groupedOptions; }

    let availabilityZoneCrispAttrib = this.config?.crispElementServiceAttributes?.find(
      (attrib) => attrib.code === CrispAttributeNames.AvailabilityZone);
    let mazALocationCrispAttrib = this.config?.crispElementServiceAttributes?.find(
      (attrib) => attrib.code === CrispAttributeNames.MazaLocation);

    collection.forEach((item) => {
      item.pods?.forEach((pod) => {
        let groupName = pod.name;
        let existingGroup = groupedOptions.find((opt) => opt.name === groupName);
        let option: FlatOption;
        if (!isNullOrEmpty(availabilityZoneCrispAttrib)) {
          let sameAvailabilityZone: boolean;
          if (pod.availabilityZone === 'LB1') {
            let labAvailabilityZoneCrispAttrib = availabilityZoneCrispAttrib.value.toString() === PodAvailabilityZone.Intellicentre1
              ? 'LB1' : availabilityZoneCrispAttrib.value.toString();
            sameAvailabilityZone = pod.availabilityZone === labAvailabilityZoneCrispAttrib;
          } else {
            sameAvailabilityZone = pod.availabilityZone === podAvailabilityZoneText[availabilityZoneCrispAttrib.value.toString()];
          }
          if (!sameAvailabilityZone) { return; }
          option = { key: item.id, value: item.name } as FlatOption;
        } else {
          if (!isNullOrEmpty(mazALocationCrispAttrib)) {
            let isMazAaTrue = item.isMAZAA;
            if (!isMazAaTrue) { return; }
            option = { key: item.id, value: item.name } as FlatOption;
          } else {
            option = { key: item.id, value: item.name } as FlatOption;
          }
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
        };
      })
    });
    let groupOptionsSortByName = groupedOptions?.sort((a, b) => a.name.localeCompare(b.name));
    return groupOptionsSortByName;
  }
  
  private _configureValidators() {
    this.config.vcloudExistInServiceValidator = this.vcloudExistInServicelsValidator.bind(this);
  }

  private _getResources(): void {
    let optionalHeaders = new Map<string, any>([
      [CommonDefinition.HEADER_COMPANY_ID, this._companyId]
    ]);

    this._apiService.getResources(optionalHeaders).pipe(
      catchError((error) => throwError(() => error.message)),
      map((resources) => {
        this._resources = resources.collection;
      })
    ).subscribe();
  }
}
