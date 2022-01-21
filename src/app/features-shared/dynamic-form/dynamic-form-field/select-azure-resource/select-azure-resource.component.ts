import {
  Component,
  forwardRef,
  ChangeDetectorRef
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { Observable } from 'rxjs';
import {
  takeUntil,
  map,
  shareReplay
} from 'rxjs/operators';

import {
  isNullOrEmpty
} from '@app/utilities';
import {
  McsAzureResource,
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

  // Filter variables
  private _resourceGroupId: string = '';

  constructor(
    private _apiService: McsApiService,
    _changeDetectorRef: ChangeDetectorRef
  ) {
    super(_changeDetectorRef);
  }

  public onFormDataChange(params: DynamicFormFieldDataChangeEventParam): void {
    switch (params.eventName) {

      case 'vnet-resource-change':
        this._resourceGroupId = params.value?.resourceGroupId;
        this.retrieveOptions();
        break;

      case 'domain-controller-change':
        this._resourceGroupId = params.value?.resourceGroupId;
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

    return this._apiService.getAzureResources().pipe(
      takeUntil(this.destroySubject),
      map((response) => response && response.collection),
      shareReplay(1));
  }

  protected filter(collection: McsAzureResource[]): FlatOption[] {
    let options: FlatOption[] = [];
    let collectionOptions = collection;
    if (isNullOrEmpty(this._resourceGroupId)) {
      return options;
    }

    collectionOptions = collection.filter((resource) => resource.resourceGroupId === this._resourceGroupId);
    let resourceByType = collectionOptions.filter((resource) => resource.type === this.config.resourceType);
    let items = resourceByType.sort((a, b) => a.name.localeCompare(b.name));

    items.forEach((item) => {
      let id = this.config?.useNameAsKey ? item.name : item.azureId;

      options.push({ type: 'flat', key: id, value: item.name });
    });

    return options;
  }
}
