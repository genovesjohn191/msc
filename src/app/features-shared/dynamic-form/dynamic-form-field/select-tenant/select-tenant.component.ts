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
  McsQueryParam,
  McsTenant
} from '@app/models';
import {
  DynamicFormFieldDataChangeEventParam,
  DynamicFormFieldOnChangeEvent,
  FlatOption
} from '../../dynamic-form-field-config.interface';
import { DynamicSelectTenantField } from './select-tenant';
import { DynamicSelectFieldComponentBase } from '../dynamic-select-field-component.base';

@Component({
  selector: 'mcs-dff-select-tenant-field',
  templateUrl: '../shared-template/select.component.html',
  styleUrls: [ '../dynamic-form-field.scss' ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DynamicSelectTenantComponent),
      multi: true
    }
  ],
  host: {
    '(blur)': 'onTouched()'
  }
})
export class DynamicSelectTenantComponent extends DynamicSelectFieldComponentBase<McsTenant> {
  public config: DynamicSelectTenantField;

  // Filter variables
  private _companyId: string = '';

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
    }
  }

  // Override function to allow field to map with service ID
  public writeValue(obj: any): void {
    if (this._serviceIdMapping.has(obj)) {
      obj = this.config.useTenantIdAsKey ? obj : this._serviceIdMapping.get(obj);
    }

    if (!isNullOrEmpty(obj)) {
      this.config.value = obj;
    }
  }

  protected callService(): Observable<McsTenant[]> {
    let optionalHeaders = new Map<string, any>([
      [CommonDefinition.HEADER_COMPANY_ID, this._companyId]
    ]);

    let param = new McsQueryParam();
    param.pageSize = 100;

    return this._apiService.getTenants(param, optionalHeaders).pipe(
      takeUntil(this.destroySubject),
      map((response) => response && response.collection));
  }

  protected filter(collection: McsTenant[]): FlatOption[] {
    let options: FlatOption[] = [];
    this._serviceIdMapping.clear();

    collection.forEach((item) => {
      if (this._exluded(item)) { return; }

      // Build a service ID map so we can map with service IDs to correct key when initializing the value
      let uniqueNonEmptyServiceId = !isNullOrEmpty(item.tenantId) && !this._serviceIdMapping.has(item.tenantId);
      if (uniqueNonEmptyServiceId) {
        this._serviceIdMapping.set(item.tenantId, item.id);
      }

      let key = this.config.useTenantIdAsKey ? item.tenantId : item.id;

      options.push({ type: 'flat', key, value: item.name });
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
    let selectedValue: McsTenant = this.config.useTenantIdAsKey
      ? this.collection.find((item) => item.tenantId === value)
      : this.collection.find((item) => item.id === value);

    this.dataChange.emit({
      value: selectedValue,
      eventName,
      dependents
    });
  }

  private _exluded(item: McsTenant): boolean {
    // Filter no service ID if service ID is used as key
    if (this.config.useTenantIdAsKey && isNullOrEmpty(item.tenantId)) {
      return true;
    }

    return false;
  }
}
