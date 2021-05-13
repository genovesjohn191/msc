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
  McsQueryParam,
  McsTerraformModule
} from '@app/models';
import {
  DynamicFormFieldDataChangeEventParam,
  DynamicFormFieldOnChangeEvent,
  FlatOption
} from '../../dynamic-form-field-config.interface';
import { DynamicSelectTerraformModuleTypeField } from './select-terraform-module-type';
import { DynamicSelectFieldComponentBase } from '../dynamic-select-field-component.base';

export type TerraformModuleType =
  | ''
  | 'TSM'
  | 'TRM'
  | 'Custom';

const groupMapping: Map<TerraformModuleType, string> = new Map([
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
    let options: FlatOption[] = [];

    let hasSolutionModuleType = collection.findIndex((item) => item.projectKey === 'TSM') >= 0;
    let hasResourceModuleType = collection.findIndex((item) => item.projectKey === 'TRM') >= 0;
    let hasCustomModuleType = collection.findIndex((item) => item.projectKey !== 'TRM' && item.projectKey !== 'TSM') >= 0;

    if (hasSolutionModuleType) {
      options.push({ type: 'flat', key: 'TSM', value: groupMapping.get('TSM') });
    }
    if (hasResourceModuleType) {
      options.push({ type: 'flat', key: 'TRM', value: groupMapping.get('TRM') });
    }
    if (hasCustomModuleType) {
      options.push({ type: 'flat', key: 'Custom', value: groupMapping.get('Custom') });
    }

    return options;
  }

  public notifyForDataChange(eventName: DynamicFormFieldOnChangeEvent, dependents: string[], value?: any): void {
    this.dataChange.emit({
      value,
      eventName,
      dependents
    });
  }
}
