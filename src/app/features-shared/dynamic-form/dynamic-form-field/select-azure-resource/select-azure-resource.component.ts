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
  McsQueryParam,
} from '@app/models';
import { McsApiService } from '@app/services';
import {
  DynamicFormFieldDataChangeEventParam,
  DynamicFormFieldOnChangeEvent,
  FlatOption
} from '../../dynamic-form-field-config.interface';
import { DynamicSelectFieldComponentBase } from '../dynamic-select-field-component.base';
import { DynamicSelectAzureResourceField } from './select-azure-resource';

@Component({
  selector: 'mcs-dff-select-azure-resource-field',
  templateUrl: '../shared-template/select.component.html',
  styleUrls: ['../dynamic-form-field.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DynamicSelectAzureResourceComponent),
      multi: true
    }
  ],
  host: {
    '(blur)': 'onTouched()'
  }
})
export class DynamicSelectAzureResourceComponent extends DynamicSelectFieldComponentBase<McsAzureResource> {
  public config: DynamicSelectAzureResourceField;
  private azureResourcesCache: Observable<McsAzureResource[]>;

  // Filter variables
  private _resourceGroupId: string = '';
  private _azureId: string = '';
  private _companyId: string = '';

  constructor(
    private _apiService: McsApiService,
    _changeDetectorRef: ChangeDetectorRef
  ) {
    super(_changeDetectorRef);
  }

  public onFormDataChange(params: DynamicFormFieldDataChangeEventParam): void {
    switch (params.eventName) {
      case 'vnet-resource-group-change':
        this._resourceGroupId = params.value?.id;
        this.retrieveOptions();
        break;

      case 'vnet-change':
        this._resourceGroupId = params.value?._resourceGroupId;
        this._azureId = params.value?.azureId;
        this.retrieveOptions();
        break;

      case 'domain-controller-resource-group-change':
        this._resourceGroupId = params.value?.id;
        this.retrieveOptions();
        break;

      case 'company-change':
        this._companyId = params.value;
        this.retrieveOptions();
        break;
    }
  }

  public notifyForDataChange(eventName: DynamicFormFieldOnChangeEvent, dependents: string[], value?: any): void {
    let dataValue = this.config?.useNameAsKey ? this.collection.find((item) => item.name === value)
      : this.collection.find((item) => item.azureId === value);

    this.dataChange.emit({
      value: dataValue,
      eventName,
      dependents
    });
  }

  protected callService(): Observable<McsAzureResource[]> {
    if (isNullOrEmpty(this._companyId) || isNullOrEmpty(this._resourceGroupId)) { return of([]); }

    let optionalHeaders = new Map<string, any>([
      [CommonDefinition.HEADER_COMPANY_ID, this._companyId]
    ]);

    let param = new McsQueryParam();
    param.pageSize = CommonDefinition.AZURE_RESOURCES_PAGE_SIZE_MAX;

    if (isNullOrEmpty(this.azureResourcesCache))  {
        let response = this._apiService.getAzureResources(param, optionalHeaders).pipe(
          takeUntil(this.destroySubject),
          map((response) => response && response.collection),
          shareReplay(1)
        );
        this.azureResourcesCache = response;
        return response;
      } else  {
        return this.azureResourcesCache;
    }
  }

  protected filter(collection: McsAzureResource[]): FlatOption[] {
    let options: FlatOption[] = [];
    let collectionOptions = collection;
    if (isNullOrEmpty(this._resourceGroupId) && isNullOrEmpty(this._azureId)) {
      return options;
    }

    //this is a workaround until we have the proper subnets endpoint working, which ascertains what the Azure ID of each subnet's network is and uses that to filter
    collectionOptions = isNullOrEmpty(this._azureId)? collectionOptions : collectionOptions.filter((resource) => (resource.azureId.split('/').slice(0, -2).join("/") === this._azureId));
    collectionOptions = isNullOrEmpty(this._resourceGroupId)? collectionOptions : collectionOptions.filter((resource) => (resource.resourceGroupId === this._resourceGroupId));
    let items = isNullOrEmpty(this.config.resourceType)? collectionOptions : collectionOptions.filter((resource) => resource.type.toUpperCase() === this.config.resourceType.toUpperCase()).sort((a, b) => a.name.localeCompare(b.name));

    items.forEach((item) => {
      let id = this.config?.useNameAsKey ? item.name : item.azureId;

      options.push({ type: 'flat', key: id, value: item.name });
    });

    return options;
  }
}
