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

import { CommonDefinition, isNullOrEmpty } from '@app/utilities';
import {
  McsQueryParam,
  McsServer,
  serviceTypeText
} from '@app/models';
import { McsApiService } from '@app/services';
import {
  DynamicFormFieldDataChangeEventParam,
  FlatOption,
  GroupedOption
} from '../../dynamic-form-field-config.interface';
import { DynamicSelectVmField } from './select-vm';
import { DynamicSelectFieldComponentBase } from '../dynamic-select-field-component.base';


@Component({
  selector: 'mcs-dff-select-vm-field',
  templateUrl: '../shared-template/select-group.component.html',
  styleUrls: [ '../dynamic-form-field.scss' ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DynamicSelectVmComponent),
      multi: true
    }
  ],
  host: {
    '(blur)': 'onTouched()'
  }
})
export class DynamicSelectVmComponent extends DynamicSelectFieldComponentBase<McsServer> {
  public config: DynamicSelectVmField;

  // Filter variables
  private _companyId: string = '';
  private _serviceId: string = '';

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

      case 'service-id-change':
        this._serviceId = params.value;
        this.filterOptions();
        break;
    }
  }

  protected callService(): Observable<McsServer[]> {
    let optionalHeaders = new Map<string, any>([
      [CommonDefinition.HEADER_COMPANY_ID, this._companyId]
    ]);

    let param = new McsQueryParam();

    return this._apiService.getServers(param, optionalHeaders).pipe(
      takeUntil(this.destroySubject),
      map((response) => {
        return response && response.collection;
      })
    );
  }

  protected filter(collection: McsServer[]): GroupedOption[] {
    let groupedOptions: GroupedOption[] = [];

    collection.forEach((item) => {
      // Filter by service ID
      if (!isNullOrEmpty(this._serviceId) && item.serviceId !== this._serviceId) {
        return;
      }

      let groupName = serviceTypeText[item.serviceType];
      let existingGroup = groupedOptions.find((opt) => opt.name === groupName);
      let option = { key: item.id, value: item.name } as FlatOption;

      if (existingGroup) {
        // Add option to existing group
        existingGroup.options.push(option);
      } else {
        // Add option to new group
        groupedOptions.push({
          type: 'group',
          name: groupName,
          options: [option]
        });
      }
    });

    return groupedOptions;
  }
}
