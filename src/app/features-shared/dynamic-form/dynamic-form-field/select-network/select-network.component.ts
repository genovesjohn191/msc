import {
  Component,
  forwardRef,
  ChangeDetectorRef
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { takeUntil, switchMap } from 'rxjs/operators';
import {
  of,
  Observable
} from 'rxjs';

import { isNullOrEmpty } from '@app/utilities';
import { McsApiService } from '@app/services';
import {
  McsResource,
  McsResourceNetwork
} from '@app/models';
import {
  DynamicFormFieldDataChange,
  FlatOption
} from '../../dynamic-form-field-data.interface';
import { DynamicSelectNetworkField } from './select-network';
import { DynamicSelectFieldComponentBase } from '../dynamic-select-field-component.base';

@Component({
  selector: 'mcs-dff-select-network-field',
  templateUrl: '../shared-template/select.component.html',
  styleUrls: [ '../dynamic-form-field.scss' ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DynamicSelectNetworkComponent),
      multi: true
    }
  ],
  host: {
    '(blur)': 'onTouched()'
  }
})
export class DynamicSelectNetworkComponent extends DynamicSelectFieldComponentBase<McsResourceNetwork> {
  public data: DynamicSelectNetworkField;

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
        this.retrieveOptions();
    }
  }

  protected callService(): Observable<McsResourceNetwork[]> {
    if (isNullOrEmpty(this._resource)) {
      return of([]);
    }

    return this._apiService.getResourceNetworks(this._resource.id).pipe(
      takeUntil(this.destroySubject),
      switchMap((response) => {
        let returnValue = response && response.collection;
        return of(returnValue);
      })
    );
  }

  protected filter(collection: McsResourceNetwork[]): FlatOption[] {
    let options: FlatOption[] = [];

    collection.forEach((item) => {
      options.push({ type: 'flat', key: item.name, value: item.name });
    });

    return options;
  }
}
