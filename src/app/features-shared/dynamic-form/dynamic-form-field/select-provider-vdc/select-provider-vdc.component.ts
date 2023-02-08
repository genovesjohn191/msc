import {
  Component,
  forwardRef,
  ChangeDetectorRef
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { Observable, of } from 'rxjs';
import {
  takeUntil,
  map
} from 'rxjs/operators';

import {
  CommonDefinition,
  isNullOrEmpty
} from '@app/utilities';
import {
  McsVcloudInstanceProviderVdc,
  DedicatedProvider,
  podAvailabilityZoneText,
  PodAvailabilityZone
} from '@app/models';
import { McsApiService } from '@app/services';

import {
  DynamicFormFieldDataChangeEventParam,
  DynamicFormFieldOnChangeEvent,
  FlatOption
} from '../../dynamic-form-field-config.interface';
import { DynamicSelectProviderVdcField } from './select-provider-vdc';
import { DynamicSelectFieldComponentBase } from '../dynamic-select-field-component.base';
import { CrispAttributeNames } from '@app/features/launch-pad/workflows/workflow/core/forms/mapping-helper';

const dedicatedProviders = [DedicatedProvider.DedicatedProviderVdc, DedicatedProvider.HighPerformanceDedicatedProviderVdc];

@Component({
  selector: 'mcs-dff-select-provider-vdc-field',
  templateUrl: './select-provider-vdc.component.html',
  styleUrls: ['../dynamic-form-field.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DynamicSelectProviderVdcComponent),
      multi: true
    }
  ],
  host: {
    '(blur)': 'onTouched()'
  }
})
export class DynamicSelectProviderVdcComponent extends DynamicSelectFieldComponentBase<McsVcloudInstanceProviderVdc> {
  public config: DynamicSelectProviderVdcField;

  // Filter variables
  private _vcloudInstance: McsVcloudInstanceProviderVdc;
  private _companyId: string = '';
  private _type: string = '';

  public showField: boolean = true;

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
        break;

      case 'vcloud-instance-change':
        if(params.value === '') { 
          this.showField = false;
          return;
        }
        this.showField = true;
        this._vcloudInstance = params.value;
        if (isNullOrEmpty(this._vcloudInstance)) { return; }
        this.retrieveOptions();
        break;
      
      case 'type-change': 
        this._type = params.value;
        break;
    }
  }

  public notifyForDataChange(eventName: DynamicFormFieldOnChangeEvent, dependents: string[], value?: any): void {
    let dataValue = this.collection.find((item) => item.id === value);

    this.dataChange.emit({
      value: dataValue,
      eventName,
      dependents
    });
  }

  protected callService(): Observable<McsVcloudInstanceProviderVdc[]> {
    if (isNullOrEmpty(this._vcloudInstance)) { return of([]); }
    let optionalHeaders = new Map<string, any>([
      [CommonDefinition.HEADER_COMPANY_ID, this._companyId]
    ]);

    let dedicatedProvVdc = this.config?.crispElementServiceAttributes?.find(
      (attrib) => attrib.code === CrispAttributeNames.DedicatedProvVdc)?.value as DedicatedProvider;
    let isDedicated = dedicatedProviders.includes(dedicatedProvVdc);

    return this._apiService.getVcloudInstanceProviderVdc(this._vcloudInstance?.id, isDedicated, optionalHeaders).pipe(
      takeUntil(this.destroySubject),
      map((response) => {
        let returnValue = response && response.collection;
        return returnValue;
      })
    );
  }

  protected filter(collection: McsVcloudInstanceProviderVdc[]): FlatOption[] {
    let options: FlatOption[] = [];
    let collectionOptions = collection;
    if (collectionOptions?.length === 0) { return options; }
    let providerVdcByType = collectionOptions.filter((vdc) => vdc.type === this._type);
    let availabilityZoneCrispAttrib = this.config?.crispElementServiceAttributes?.find(
      (attrib) => attrib.code === CrispAttributeNames.AvailabilityZone);
    let items: McsVcloudInstanceProviderVdc[] = [];
   
    if (!isNullOrEmpty(availabilityZoneCrispAttrib)) {
      items = providerVdcByType.filter((vdc) => { 
        let hasMatchingPods = vdc?.pods?.filter((pod) => {
          if (pod.availabilityZone === 'LB1') {
            let labAvailabilityZoneCrispAttrib = availabilityZoneCrispAttrib.value.toString() === PodAvailabilityZone.Intellicentre1
              ? 'LB1' : availabilityZoneCrispAttrib.value.toString();
            return pod.availabilityZone ===  labAvailabilityZoneCrispAttrib;
          }
          return pod.availabilityZone === podAvailabilityZoneText[availabilityZoneCrispAttrib.value.toString()];
        });
          
        if (hasMatchingPods?.length === 0) { return false; }
        return true;
        });
    } else {
      items = providerVdcByType.filter((vdc) => vdc.isMAZAA === true);
    }

    items.forEach((item) => {
      options.push({ type: 'flat', key: item.id, value: item.name });
    });
    return options;
  }
}
