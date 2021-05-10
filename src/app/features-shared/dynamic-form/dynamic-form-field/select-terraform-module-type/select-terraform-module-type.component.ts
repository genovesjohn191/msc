import {
  Component,
  forwardRef,
  ChangeDetectorRef
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { takeUntil, map } from 'rxjs/operators';
import {
  of,
  Observable
} from 'rxjs';

import {
  CommonDefinition,
  isNullOrEmpty
} from '@app/utilities';
import { McsApiService } from '@app/services';
import {
  McsAvailabilityZone,
  McsQueryParam,
  McsResource,
  McsResourceNetwork,
  McsTerraformModule
} from '@app/models';
import {
  DynamicFormFieldDataChangeEventParam,
  DynamicFormFieldOnChangeEvent,
  FlatOption
} from '../../dynamic-form-field-config.interface';
import { DynamicSelectTerraformModuleTypeField } from './select-terraform-module-type';
import { DynamicSelectFieldComponentBase } from '../dynamic-select-field-component.base';

const groupMapping: Map<string, string> = new Map([
  ['TSM','Azure Solution'],
  ['TRM','Azure Resource'],
  ['Custom','Customer Specific'],
]);

@Component({
  selector: 'mcs-dff-select-terraform-module-type-field',
  templateUrl: '../shared-template/select.component.html',
  styleUrls: [ '../dynamic-form-field.scss' ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DynamicSelectTerraformModuleTypeComponent),
      multi: true
    }
  ],
  host: {
    '(blur)': 'onTouched()'
  }
})
export class DynamicSelectTerraformModuleTypeComponent extends DynamicSelectFieldComponentBase<McsTerraformModule> {
  public config: DynamicSelectTerraformModuleTypeField;

  private _companyId: string = '';

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

  protected callService(): Observable<McsTerraformModule[]> {
    if (isNullOrEmpty(this._companyId)) {
      return of([]);
    }

    let optionalHeaders = new Map<string, any>([
      [CommonDefinition.HEADER_COMPANY_ID, this._companyId]
    ]);

    let param = new McsQueryParam();
    param.pageSize = 2000;

    return this._apiService.getTerraformModules(param, optionalHeaders)
    .pipe(
      takeUntil(this.destroySubject),
      map((response) => response && response.collection));
  }

  protected filter(collection: McsTerraformModule[]): FlatOption[] {
    let options: FlatOption[] = [
      {
        key: 'TSM', value: groupMapping.get('TSM')
      },
      {
        key: 'TRM', value: groupMapping.get('TRM')
      },
      {
        key: 'Custom', value: groupMapping.get('Custom')
      }
    ];

    // collection.forEach((item) => {
    //   options.push({ type: 'flat', key: item.id, value: item.name });
    // });

    return options;
  }

  public notifyForDataChange(eventName: DynamicFormFieldOnChangeEvent, dependents: string[], value?: any): void {
    this.dataChange.emit({
      value: this.collection.find((item) => item.name === value),
      eventName,
      dependents
    });
  }
}
