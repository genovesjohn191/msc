import {
  Component,
  forwardRef,
  ChangeDetectorRef
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import {
  map,
  Observable,
  of,
  Subject,
  takeUntil
} from 'rxjs';

import { CommonDefinition, isNullOrEmpty, isNullOrUndefined } from '@app/utilities';
import { McsAzureResource, McsAzureResourceQueryParams } from '@app/models';
import {
  DynamicFormFieldDataChangeEventParam,
  DynamicFormFieldOnChangeEvent,
  FlatOption
} from '../../dynamic-form-field-config.interface';
import { DynamicSelectFieldComponentBase } from '../dynamic-select-field-component.base';
import { DynamicSelectPublicCloudResourceField } from './select-public-cloud-resource';
import { TranslateService } from '@ngx-translate/core';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsApiService } from '@app/services';

@Component({
  selector: 'mcs-dff-select-public-cloud-resource-field',
  templateUrl: '../shared-template/select.component.html',
  styleUrls: ['../dynamic-form-field.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DynamicSelectPublicCloudResourceComponent),
      multi: true
    }
  ],
  host: {
    '(blur)': 'onTouched()'
  }
})
export class DynamicSelectPublicCloudResourceComponent extends DynamicSelectFieldComponentBase<McsAzureResource> {
  public config: DynamicSelectPublicCloudResourceField;

  // Filter variables
  private _companyId: string = '';
  private _linkedSubscriptionUuid: string = '';
  private _destroySubject = new Subject<void>();

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
      case 'linked-service-id-change':
        this._linkedSubscriptionUuid = params.value;
        this.retrieveOptions();
        break;
    }
  }

  public notifyForDataChange(eventName: DynamicFormFieldOnChangeEvent, dependents: string[], value?: any): void {
    let dataValue = this.setDataValue(value);

    this.dataChange.emit({
      value: dataValue,
      eventName,
      dependents
    });
  }

  private setDataValue(value: string): McsAzureResource {
    if (isNullOrEmpty(value) || this.collection?.length === 0) { return; }

    if (this.config?.useAzureIdAsKey) {
      return this.collection.find((item) => item.azureId === value);
    }
    if (this.config?.useNameAsKey) {
      return this.collection.find((item) => item.name === value);
    }
    return this.collection.find((item) => item.id === value);
  }

  protected callService(): Observable<McsAzureResource[]> {
    if(isNullOrUndefined(this._companyId) || isNullOrUndefined(this._linkedSubscriptionUuid)) { return of([]) }
    let optionalHeaders = new Map<string, any>([
      [CommonDefinition.HEADER_COMPANY_ID, this._companyId]
    ]);
    let param = new McsAzureResourceQueryParams();
    param.pageSize = CommonDefinition.AZURE_RESOURCES_PAGE_SIZE_MAX;
    param.subscriptionId = this._linkedSubscriptionUuid;

    return this._apiService.getAzureResources(param, optionalHeaders).pipe(
      takeUntil(this._destroySubject),
      map(response =>  response.collection));
  }

  protected filter(collection: McsAzureResource[]): FlatOption[] {
    let options: FlatOption[] = [];
    let collectionOptions = collection;
    if (isNullOrEmpty(collectionOptions)) { return options; }

    let items = isNullOrEmpty(this.config.resourceTypes) ? collectionOptions :
      collectionOptions.filter((resource) => 
        this.config.resourceTypes.includes(resource.type.toUpperCase()))
        .sort((a, b) => a.name.localeCompare(b.name));

    items.forEach((item) => {
      let id = this.setOptionKey(item);
      options.push({ type: 'flat', key: id, value: item.name });
    });
    return options;
  }

  private setOptionKey(item: McsAzureResource): string {
    if (isNullOrEmpty(item)) { return; }
    if (this.config?.useNameAsKey) { return item?.name; }
    if (this.config?.useAzureIdAsKey) { return item?.azureId; }
    return item?.id;
  }
}
