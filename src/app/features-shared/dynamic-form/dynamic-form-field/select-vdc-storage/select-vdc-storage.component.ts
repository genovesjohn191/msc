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
  compareStrings,
  isNullOrEmpty
} from '@app/utilities';
import {
  McsResource,
  McsResourceQueryParam
} from '@app/models';
import { McsApiService } from '@app/services';

import {
  DynamicFormFieldDataChangeEventParam,
  DynamicFormFieldOnChangeEvent,
  FlatOption
} from '../../dynamic-form-field-config.interface';
import { DynamicSelectFieldComponentBase } from '../dynamic-select-field-component.base';
import { CrispAttributeNames } from '@app/features/launch-pad/workflows/workflow/core/forms/mapping-helper';
import { DynamicSelectVdcStorageField } from './select-vdc-storage';

@Component({
  selector: 'mcs-dff-select-vdc-storage-field',
  templateUrl: './select-vdc-storage.component.html',
  styleUrls: ['../dynamic-form-field.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DynamicSelectVdcStorageComponent),
      multi: true
    }
  ],
  host: {
    '(blur)': 'onTouched()'
  }
})
export class DynamicSelectVdcStorageComponent extends DynamicSelectFieldComponentBase<McsResource> {
  public config: DynamicSelectVdcStorageField;

  // Filter variables
  private _companyId: string = '';

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


  public notifyForDataChange(eventName: DynamicFormFieldOnChangeEvent, dependents: string[], value?: any): void {
    let dataValue = this.collection.find((item) => item.id === value);

    this.dataChange.emit({
      value: dataValue,
      eventName,
      dependents
    });
  }

  protected callService(): Observable<McsResource[]> {
    let optionalHeaders = new Map<string, any>([
      [CommonDefinition.HEADER_COMPANY_ID, this._companyId]
    ]);

    let param = new McsResourceQueryParam();
    param.pageSize = CommonDefinition.PAGE_SIZE_MAX;
    param.platform = 'VCloud'

    return this._apiService.getResources(optionalHeaders, param).pipe(
      takeUntil(this.destroySubject),
      map((response) => {
        let returnValue = response && response.collection;
        return returnValue;
      })
    );
  }

  protected filter(collection: McsResource[]): FlatOption[] {
    let options: FlatOption[] = [];
    if (collection?.length === 0) { return options; }
    let ic2AccessCrispAttrib = this.config?.crispElementServiceAttributes?.find(
      (attrib) => attrib.code === CrispAttributeNames.Ic2Access)?.displayValue;
    let linkSrvMazaCrispAttrib = this.config?.crispElementServiceAttributes?.find(
      (attrib) => attrib.code === CrispAttributeNames.LinkSrvMaza)?.displayValue;

    collection.forEach((resource) => {

      if (isNullOrEmpty(resource.serviceId)) { return; }
      let hasMatchingCrispAttrib = compareStrings(resource.serviceId, ic2AccessCrispAttrib) === 0 ||
        compareStrings(resource.serviceId, linkSrvMazaCrispAttrib) === 0;

      options.push({
        type: 'flat',
        key: resource.id,
        value: resource.serviceId,
        disabled: !hasMatchingCrispAttrib
      });
    });

    let availableOptions = options?.filter((option) => !option.disabled);

    if (availableOptions?.length === 1) {
      this.config.initialValue = options?.find((option) => !option.disabled)?.key;
      // Force the control to reselect the initial value
      this.writeValue(this.config.initialValue);
      // Force the form to check the validty of the control
      this.valueChange(this.config.initialValue);
    }

    return options;
  }
}
