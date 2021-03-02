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
  McsBackUpAggregationTarget,
  McsQueryParam
} from '@app/models';
import { McsApiService } from '@app/services';
import {
  DynamicFormFieldDataChangeEventParam,
  FlatOption
} from '../../dynamic-form-field-config.interface';
import { DynamicSelectBatField } from './select-bat';
import { DynamicSelectFieldComponentBase } from '../dynamic-select-field-component.base';

@Component({
  selector: 'mcs-dff-select-bat-field',
  templateUrl: '../shared-template/select.component.html',
  styleUrls: [ '../dynamic-form-field.scss' ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DynamicSelectBatComponent),
      multi: true
    }
  ],
  host: {
    '(blur)': 'onTouched()'
  }
})
export class DynamicSelectBatComponent extends DynamicSelectFieldComponentBase<McsBackUpAggregationTarget> {
  public config: DynamicSelectBatField;

  // Filter variables
  private _companyId: string = '';

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

  protected callService(): Observable<McsBackUpAggregationTarget[]> {
    let optionalHeaders = new Map<string, any>([
      [CommonDefinition.HEADER_COMPANY_ID, this._companyId]
    ]);

    let param = new McsQueryParam();

    return this._apiService.getBackupAggregationTargets(param, optionalHeaders).pipe(
      takeUntil(this.destroySubject),
      map((response) => {
        console.log(response.collection);
        return response && response.collection;
      })
    );
  }

  protected filter(collection: McsBackUpAggregationTarget[]): FlatOption[] {
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

      options.push({ type: 'flat', key, value: item.serviceId });
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

  private _exluded(item: McsBackUpAggregationTarget): boolean {
    // Filter no service ID if service ID is used as key
    if (this.config.useServiceIdAsKey && isNullOrEmpty(item.serviceId)) {
      return true;
    }

    return false;
  }
}
