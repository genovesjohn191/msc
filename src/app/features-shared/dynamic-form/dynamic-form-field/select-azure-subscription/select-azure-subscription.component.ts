import {
  Component,
  forwardRef,
  ChangeDetectorRef
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { takeUntil, map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

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

  private _subscriptionIdMapping: Map<string, string> = new Map<string, string>();

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
        this._tenant = null;
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
    if (this._subscriptionIdMapping.has(obj)) {
      obj = this.config.useSubscriptionIdAsKey ? obj : this._subscriptionIdMapping.get(obj);
    }

    if (!isNullOrEmpty(obj)) {
      this.config.value = obj;
    }
  }

  protected callService(): Observable<McsAzureService[]> {
    if (isNullOrEmpty(this._companyId) || isNullOrEmpty(this._tenant)) {
      return of([]);
    }

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
    this._subscriptionIdMapping.clear();

    collection.forEach((item) => {
      if (this._exluded(item)) { return; }

      // Build a subscription ID map so we can map with subscription IDs to correct key when initializing the value
      let uniqueNonEmptySubscriptionId = !isNullOrEmpty(item.subscriptionId) && !this._subscriptionIdMapping.has(item.subscriptionId);
      if (uniqueNonEmptySubscriptionId) {
        this._subscriptionIdMapping.set(item.subscriptionId, item.id);
      }

      let key = this.config.useSubscriptionIdAsKey ? item.subscriptionId : item.id;
      let subscriptionid = this.shortenGuid(item.subscriptionId);
      let value = `${item.friendlyName} (${subscriptionid})`
      options.push({ type: 'flat', key, value });
    });

    let initialValueIsValidSubscriptionId = this._subscriptionIdMapping.has(this.config.initialValue);
    if (initialValueIsValidSubscriptionId) {
      // Force the control to reselect the initial value
      this.writeValue(this.config.initialValue);
      // Force the form to check the validty of the control
      this.valueChange(this.config.initialValue);
    }

    return options;
  }

  public notifyForDataChange(eventName: DynamicFormFieldOnChangeEvent, dependents: string[], value?: any): void {
    let selectedValue: McsAzureService = this.config.useSubscriptionIdAsKey
      ? this.collection.find((item) => item.subscriptionId === value)
      : this.collection.find((item) => item.id === value);

    this.dataChange.emit({
      value: selectedValue,
      eventName,
      dependents
    });
  }

  private _exluded(item: McsAzureService): boolean {
    // Filter no service ID if service ID is used as key
    if (this.config.useSubscriptionIdAsKey && isNullOrEmpty(item.subscriptionId)) {
      return true;
    }

    return false;
  }

  private shortenGuid(guid: string): string {
    return guid.substring(0, 4) + ' ... ' + guid.substring(guid.length - 5, guid.length - 1);
  }
}
