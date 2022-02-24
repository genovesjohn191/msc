import {
  Component,
  forwardRef,
  ChangeDetectorRef
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import {
  Observable,
  of
} from 'rxjs';
import {
  takeUntil,
  map,
  shareReplay
} from 'rxjs/operators';

import {
  CommonDefinition,
  isNullOrEmpty
} from '@app/utilities';
import {
  McsAzureResource,
  McsQueryParam
} from '@app/models';
import { McsApiService } from '@app/services';
import {
  DynamicFormFieldDataChangeEventParam,
  DynamicFormFieldOnChangeEvent,
  FlatOption
} from '../../dynamic-form-field-config.interface';
import { DynamicSelectFieldComponentBase } from '../dynamic-select-field-component.base';
import { DynamicSelectResourceGroupField } from './select-resource-group';

export enum ResourceGroupEventName {
  VnetChange = 'vnet-resource-change',
  DomainChange = 'domain-controller-change'
}

@Component({
  selector: 'mcs-dff-select-resource-group-field',
  templateUrl: '../shared-template/select.component.html',
  styleUrls: ['../dynamic-form-field.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DynamicSelectResourceGroupComponent),
      multi: true
    }
  ],
  host: {
    '(blur)': 'onTouched()'
  }
})
export class DynamicSelectResourceGroupComponent extends DynamicSelectFieldComponentBase<McsAzureResource> {
  public config: DynamicSelectResourceGroupField;

  // Filter variables
  private _companyId: string = '';

  constructor(
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

  public notifyForDataChange(eventName: DynamicFormFieldOnChangeEvent, dependents: string[], value?: any): void {
    let dataValue = this.config?.useAzureIdAsKey ? this.collection.find((item) => item.azureId === value)
      : this.collection.find((item) => item.id === value);
    if (this.config?.useNameAsKey) { dataValue = this.collection.find((item) => item.name === value) };

    this.dataChange.emit({
      value: dataValue,
      eventName,
      dependents
    });
  }

  protected callService(): Observable<McsAzureResource[]> {
    if (isNullOrEmpty(this._companyId)) { return of([]); }

    let optionalHeaders = new Map<string, any>([
      [CommonDefinition.HEADER_COMPANY_ID, this._companyId]
    ]);

    let param = new McsQueryParam();
    param.pageSize = CommonDefinition.AZURE_RESOURCES_PAGE_SIZE_MAX;

    return this._apiService.getAzureResources(param, optionalHeaders).pipe(
      takeUntil(this.destroySubject),
      map((response) => response && response.collection),
      shareReplay(1));
  }

  protected filter(collection: McsAzureResource[]): FlatOption[] {
    let options: FlatOption[] = [];
    let collectionOptions = collection;
    let resourceByType = collectionOptions.filter((resource) => resource.type === this.config.resourceType);
    let items = resourceByType.sort((a, b) => a.name.localeCompare(b.name));

    items.forEach((item) => {
      let id = this.config?.useAzureIdAsKey ? item.azureId : item.id;
      if (this.config?.useNameAsKey) { id = item.name };

      options.push({ type: 'flat', key: id, value: item.name });
    });

    return options;
  }
}
