import {
  Component,
  forwardRef,
  ChangeDetectorRef
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { switchMap, takeUntil } from 'rxjs/operators';
import {
  of,
  Observable
} from 'rxjs';

import { McsApiService } from '@app/services';
import {
  McsResource,
  McsServerOperatingSystem
} from '@app/models';
import {
  DynamicFormFieldDataChange,
  GroupedOption,
  FlatOption
} from '../../dynamic-form-field-data.interface';
import { DynamicSelectOsField } from './select-os';
import { DynamicSelectFieldComponentBase } from '../dynamic-select-field-component.base';

@Component({
  selector: 'mcs-dff-select-os-field',
  templateUrl: '../shared-template/select-group.component.html',
  styleUrls: [ '../dynamic-form-field.scss' ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DynamicSelectOsComponent),
      multi: true
    }
  ],
  host: {
    '(blur)': 'onTouched()'
  }
})
export class DynamicSelectOsComponent extends DynamicSelectFieldComponentBase<McsServerOperatingSystem> {
  public data: DynamicSelectOsField;

  // Filter variables
  private _resource: McsResource;

  public constructor(
    private _apiService: McsApiService,
    _changeDetectorRef: ChangeDetectorRef
  ) {
    super(_changeDetectorRef);
  }

  public onFormDataChange(params: DynamicFormFieldDataChange): void {
    switch (params.onChangeEvent) {
      case 'resource-change':
        this._resource = params.value as McsResource;
        this.filterOptions();
    }
  }

  protected callService(): Observable<McsServerOperatingSystem[]> {
    return this._apiService.getServerOs().pipe(
      takeUntil(this.destroySubject),
      switchMap((response) => {
        return of(response && response.collection);
      })
    );
  }

  protected filter(collection: McsServerOperatingSystem[]): GroupedOption[] {
    let groupedOptions: GroupedOption[] = [];

    collection.forEach((item) => {
      // Filter by serviceType
      if (this._resource && this._resource.serviceType !== item.serviceType) {
        return;
      }

      let groupName =
        item.type === 'LIN' ? 'CentOs'
        : item.type === 'WIN' ? 'Microsoft'
        : 'Custom Template';
      let existingGroup = groupedOptions.find((opt) => opt.name === groupName);
      let option = {key: item.name, value: item.name} as FlatOption;


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
