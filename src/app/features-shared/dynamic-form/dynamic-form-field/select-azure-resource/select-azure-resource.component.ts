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

import { isNullOrEmpty } from '@app/utilities';
import { McsAzureResource } from '@app/models';
import {
  DynamicFormFieldDataChangeEventParam,
  DynamicFormFieldOnChangeEvent,
  FlatOption
} from '../../dynamic-form-field-config.interface';
import { DynamicSelectFieldComponentBase } from '../dynamic-select-field-component.base';
import { DynamicSelectAzureResourceField } from './select-azure-resource';
import { DynamicSelectResourceGroupService } from '../dynamic-select-resource-group.service';

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
  private _azureId: string = '';
  private _isNotified: boolean = false;

  constructor(
    private _selectResourceService: DynamicSelectResourceGroupService,
    _changeDetectorRef: ChangeDetectorRef
  ) {
    super(_changeDetectorRef);
  }

  public onFormDataChange(params: DynamicFormFieldDataChangeEventParam): void {
    switch (params.eventName) {
      case 'vnet-resource-group-change':
        this._resourceGroupId = params.value?.id;
        this.clearFormField(false);
        this.retrieveOptions();
        break;

      case 'vnet-change':
        this._resourceGroupId = params.value?.resourceGroupId;
        this._azureId = params.value?.azureId;
        this.clearFormField(false);
        this.retrieveOptions();
        break;

      case 'domain-controller-resource-group-change':
        this._resourceGroupId = params.value?.id;
        this.clearFormField(false);
        this.retrieveOptions();
        break;

      case 'avd-resource-group-change':
        if (this._isNotified) { return; }
        this._isNotified = true;
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
    return of(this._selectResourceService.azureResources);
  }

  protected filter(collection: McsAzureResource[]): FlatOption[] {
    let options: FlatOption[] = [];
    let collectionOptions = collection;
    if (isNullOrEmpty(collectionOptions)) { return options; }

    let fieldResourceGroup = (this.config?.key === 'vnetResourceGroup' ||  this.config?.key === 'domainControllerResourceGroup');
    if (!fieldResourceGroup) {
      if (isNullOrEmpty(this._resourceGroupId) && isNullOrEmpty(this._azureId)) { return options; }
      // this is a workaround until we have the proper subnets endpoint working,
      // which ascertains what the Azure ID of each subnet's network is and uses that to filter
      collectionOptions = isNullOrEmpty(this._azureId) ? collectionOptions :
        collectionOptions.filter((resource) => (resource.azureId.split('/').slice(0, -2).join("/") === this._azureId));
      collectionOptions = isNullOrEmpty(this._resourceGroupId) ? collectionOptions :
        collectionOptions.filter((resource) => (resource.resourceGroupId === this._resourceGroupId));
    }

    let items = isNullOrEmpty(this.config.resourceType) ? collectionOptions :
      collectionOptions.filter((resource) => resource.type.toUpperCase() === this.config.resourceType.toUpperCase())
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
