import {
  Component,
  forwardRef,
  ChangeDetectorRef
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { Observable } from 'rxjs';

import {
  DynamicFormFieldDataChangeEventParam,
  GroupedOption,
  FlatOption
} from '../../dynamic-form-field-config.interface';
import { DynamicSelectMultipleNetworkDbPodsField } from './select-multiple-network-db-pods';
import { DynamicSelectFieldComponentBase } from '../dynamic-select-field-component.base';
import { McsNetworkDbPod } from '@app/models';
import { McsApiService } from '@app/services';
import { map, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'mcs-dff-select-multiple-network-db-pods-field',
  templateUrl: './select-multiple-network-db-pods.component.html',
  styleUrls: [
    '../dynamic-form-field.scss',
    './select-multiple-network-db-pods.component.scss'
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DynamicSelectMultipleNetworkDbPodsComponent),
      multi: true
    }
  ]
})
export class DynamicSelectMultipleNetworkDbPodsComponent extends DynamicSelectFieldComponentBase<McsNetworkDbPod> {
  public config: DynamicSelectMultipleNetworkDbPodsField;

  public constructor(
    private _apiService: McsApiService,
    _changeDetectorRef: ChangeDetectorRef
  ) {
    super(_changeDetectorRef);
  }

  public onFormDataChange(params: DynamicFormFieldDataChangeEventParam): void {
    throw new Error('Method not implemented.');
  }

  protected callService(): Observable<McsNetworkDbPod[]> {
    return this._apiService.getNetworkDbPods().pipe(
      takeUntil(this.destroySubject),
      map((response) => response && response.collection));
  }

  protected filter(collection: McsNetworkDbPod[]): GroupedOption[] {
    let groupedOptions: GroupedOption[] = [];
    collection.sort((a,b) => a.siteName.localeCompare(b.siteName))
    .forEach((item) => {
      // if (this._exluded(item)) { return; }

      let groupName = item.siteName;
      let existingGroup = groupedOptions.find((opt) => opt.name === groupName);
      let option = { key: item.id, value: item.name} as FlatOption;

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
