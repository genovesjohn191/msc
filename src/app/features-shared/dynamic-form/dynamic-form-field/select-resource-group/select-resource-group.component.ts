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
import { DynamicSelectResourceGroupField } from './select-resource-group';
import { DynamicSelectResourceGroupService } from '../dynamic-select-resource-group.service';


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
  private _linkedSubscriptionUuid: string;

  constructor(
    private _selectResourceService: DynamicSelectResourceGroupService,
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

      case 'linked-subscription-id-change':
        this._linkedSubscriptionUuid = params.foreignKeyValue;
        this.retrieveOptions();
        break;
    }
  }

  public notifyForDataChange(eventName: DynamicFormFieldOnChangeEvent, dependents: string[], value?: any): void {
    if (isNullOrEmpty(this.collection)) { return; }
    let dataValue = this.collection.find((item) => item.azureId === value);

    this.dataChange.emit({
      value: dataValue,
      eventName,
      dependents
    });
  }

  protected callService(): Observable<McsAzureResource[]> {
    if (isNullOrEmpty(this._companyId) || isNullOrEmpty(this._linkedSubscriptionUuid)) { return of([]); }
    if (!isNullOrEmpty(this._selectResourceService.azureResources)) {
      return of(this._selectResourceService.azureResources);
    }
    return this._selectResourceService.getAzureResources(this._companyId, this._linkedSubscriptionUuid);
  }

  protected filter(collection: McsAzureResource[]): FlatOption[] {
    let options: FlatOption[] = [];
    let collectionOptions = collection;
    if (collectionOptions?.length === 0) { return options; }
    let resourceByType = collectionOptions.filter((resource) => resource.type === this.config.resourceType);
    let items = resourceByType.sort((a, b) => a.name.localeCompare(b.name));

    items.forEach((item) => {
      options.push({ type: 'flat', key: item.azureId, value: item.name });
    });
    if (!isNullOrEmpty(options)) {
      this.notifyForDataChange('avd-resource-group-change', this.config.dependents, '');
    }
    return options;
  }
}
