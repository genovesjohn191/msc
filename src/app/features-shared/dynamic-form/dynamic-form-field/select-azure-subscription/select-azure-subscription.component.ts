import {
  Component,
  forwardRef,
  ChangeDetectorRef
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { takeUntil, map } from 'rxjs/operators';
import { Observable } from 'rxjs';

import {
  CommonDefinition,
  isNullOrEmpty
} from '@app/utilities';
import { McsApiService } from '@app/services';
import {
  McsAzureService,
  McsAzureServicesRequestParams,
  McsTenant
} from '@app/models';
import {
  DynamicFormFieldDataChangeEventParam,
  DynamicFormFieldOnChangeEvent,
  FlatOption
} from '../../dynamic-form-field-config.interface';
import { DynamicSelectAzureSubscriptionField } from './select-azure-subscription';
import { DynamicSelectFieldComponentBase } from '../dynamic-select-field-component.base';

@Component({
  selector: 'mcs-dff-select-azure-subscription-field',
  templateUrl: '../shared-template/select.component.html',
  styleUrls: [ '../dynamic-form-field.scss' ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DynamicSelectAzureSubscriptionComponent),
      multi: true
    }
  ],
  host: {
    '(blur)': 'onTouched()'
  }
})
export class DynamicSelectAzureSubscriptionComponent extends DynamicSelectFieldComponentBase<McsAzureService> {
  public config: DynamicSelectAzureSubscriptionField;

  // Filter variables
  private _companyId: string = '';
  private _tenant: McsTenant;

  private _serviceIdMapping: Map<string, string> = new Map<string, string>();

  public constructor(
    private _apiService: McsApiService,
    _changeDetectorRef: ChangeDetectorRef
  ) {
    super(_changeDetectorRef);
  }

  public onFormDataChange(params: DynamicFormFieldDataChangeEventParam): void {
    switch (params.eventName) {

      case 'company-change':
        this._companyId = params.value;
        this.retrieveOptions();
        break;

      case 'tenant-change':
        this._tenant = params.value as McsTenant;
        this.retrieveOptions();
        break;
    }
  }

  // Override function to allow field to map with service ID
  public writeValue(obj: any): void {
    if (this._serviceIdMapping.has(obj)) {
      obj = this.config.useServiceIdAsKey ? obj : this._serviceIdMapping.get(obj);
    }

    if (!isNullOrEmpty(obj)) {
      this.config.value = obj;
    }
  }

  protected callService(): Observable<McsAzureService[]> {
    let optionalHeaders = new Map<string, any>([
      [CommonDefinition.HEADER_COMPANY_ID, this._companyId]
    ]);

    let param = new McsAzureServicesRequestParams();
    param.pageSize = 500;
    param.tenantId = this._tenant?.tenantId;

    return this._apiService.getAzureServices(param, optionalHeaders).pipe(
      takeUntil(this.destroySubject),
      map((response) => response && response.collection));
  }

  protected filter(collection: McsAzureService[]): FlatOption[] {
    let options: FlatOption[] = [];
    this._serviceIdMapping.clear();

    collection.forEach((item) => {
      if (this._exluded(item)) { return; }

      // Build a service ID map so we can map with service IDs to correct key when initializing the value
      let uniqueNonEmptyServiceId = !isNullOrEmpty(item.serviceId) && !this._serviceIdMapping.has(item.serviceId);
      if (uniqueNonEmptyServiceId) {
        this._serviceIdMapping.set(item.serviceId, item.id);
      }

      let key = this.config.useServiceIdAsKey ? item.serviceId : item.id;

      options.push({ type: 'flat', key, value: item.friendlyName });
    });

    let initialValueIsValidServiceId = this._serviceIdMapping.has(this.config.initialValue);
    if (initialValueIsValidServiceId) {
      // Force the control to reselect the initial value
      this.writeValue(this.config.initialValue);
      // Force the form to check the validty of the control
      this.valueChange(this.config.initialValue);
    }

    return options;
  }

  public notifyForDataChange(eventName: DynamicFormFieldOnChangeEvent, dependents: string[], value?: any): void {
    let selectedValue: McsAzureService = this.config.useServiceIdAsKey
      ? this.collection.find((item) => item.serviceId === value)
      : this.collection.find((item) => item.id === value);

    this.dataChange.emit({
      value: selectedValue,
      eventName,
      dependents
    });
  }

  private _exluded(item: McsAzureService): boolean {
    // Filter no service ID if service ID is used as key
    if (this.config.useServiceIdAsKey && isNullOrEmpty(item.serviceId)) {
      return true;
    }

    return false;
  }
}
