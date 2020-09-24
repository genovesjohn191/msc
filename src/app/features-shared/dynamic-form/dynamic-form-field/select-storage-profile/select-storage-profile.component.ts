import { NG_VALUE_ACCESSOR } from '@angular/forms';
import {
  Component,
  forwardRef,
  ChangeDetectorRef
} from '@angular/core';
import {
  takeUntil,
  switchMap
} from 'rxjs/operators';
import {
  of,
  Observable
} from 'rxjs';

import { isNullOrEmpty } from '@app/utilities';
import { McsApiService } from '@app/services';
import { McsResource, McsResourceStorage } from '@app/models';
import {
  DynamicFormFieldDataChangeEventParam,
  FlatOption
} from '../../dynamic-form-field-data.interface';
import { DynamicSelectStorageProfileField } from './select-storage-profile';
import { DynamicSelectFieldComponentBase } from '../dynamic-select-field-component.base';

@Component({
  selector: 'mcs-dff-select-storage-profile-field',
  templateUrl: '../shared-template/select.component.html',
  styleUrls: [ '../dynamic-form-field.scss' ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DynamicSelectStorageProfileComponent),
      multi: true
    }
  ],
  host: {
    '(blur)': 'onTouched()'
  }
})
export class DynamicSelectStorageProfileComponent extends DynamicSelectFieldComponentBase<McsResourceStorage> {
  public data: DynamicSelectStorageProfileField;

  // Filter variables
  private _resource: McsResource;

  public constructor(
    private _apiService: McsApiService,
    _changeDetectorRef: ChangeDetectorRef
  ) {
    super(_changeDetectorRef);
  }

  public onFormDataChange(params: DynamicFormFieldDataChangeEventParam): void {
    switch (params.eventName) {
      case 'resource-change':
        this._resource = params.value as McsResource;
        this.retrieveOptions();
    }
  }

  protected callService(): Observable<McsResourceStorage[]> {
    if (isNullOrEmpty(this._resource)) {
      return of([]);
    }

    return this._apiService.getResourceStorages(this._resource.id).pipe(
      takeUntil(this.destroySubject),
      switchMap((response) => {
        let returnValue = response && response.collection;
        return of(returnValue);
      })
    );
  }

  protected filter(collection: McsResourceStorage[]): FlatOption[] {
    let options: FlatOption[] = [];

    collection.forEach((item) => {
      options.push({ type: 'flat', key: item.name, value: item.name });
    });

    return options;
  }
}
