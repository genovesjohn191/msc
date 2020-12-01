import { NG_VALUE_ACCESSOR } from '@angular/forms';
import {
  Component,
  forwardRef,
  ChangeDetectorRef
} from '@angular/core';
import {
  takeUntil,
  map
} from 'rxjs/operators';
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
  McsResource,
  McsResourceStorage
} from '@app/models';
import {
  DynamicFormFieldDataChangeEventParam,
  FlatOption
} from '../../dynamic-form-field-config.interface';
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
  public config: DynamicSelectStorageProfileField;

  // Filter variables
  private _resource: McsResource;
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

      case 'resource-change':
        this._resource = params.value as McsResource;
        this.retrieveOptions();
        break;
    }
  }

  protected callService(): Observable<McsResourceStorage[]> {
    if (isNullOrEmpty(this._resource)) { return of([]); }

    let optionalHeaders = new Map<string, any>([
      [CommonDefinition.HEADER_COMPANY_ID, this._companyId]
    ]);

    return this._apiService.getResourceStorages(this._resource.id, optionalHeaders).pipe(
      takeUntil(this.destroySubject),
      map((response) => response && response.collection));
  }

  protected filter(collection: McsResourceStorage[]): FlatOption[] {
    let options: FlatOption[] = [];

    collection.forEach((item) => {
      options.push({ type: 'flat', key: item.name, value: item.name });
    });

    return options;
  }
}
