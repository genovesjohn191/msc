import {
  Component,
  forwardRef,
  ChangeDetectorRef
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import {
  takeUntil,
  map
} from 'rxjs/operators';
import {
  Observable,
  of
} from 'rxjs';

import { McsApiService } from '@app/services';
import {
  McsLocation,
  McsQueryParam,
} from '@app/models';
import {
  DynamicFormFieldDataChangeEventParam,
  DynamicFormFieldOnChangeEvent,
  FlatOption
} from '../../dynamic-form-field-config.interface';
import { DynamicSelectFieldComponentBase } from '../dynamic-select-field-component.base';
import { DynamicSelectLocationField } from './select-location';
import {
  CommonDefinition,
  isNullOrEmpty
} from '@app/utilities';

@Component({
  selector: 'mcs-dff-select-location-field',
  templateUrl: '../shared-template/select.component.html',
  styleUrls: [ '../dynamic-form-field.scss' ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DynamicSelectLocationComponent),
      multi: true
    }
  ],
  host: {
    '(blur)': 'onTouched()'
  }
})
export class DynamicSelectLocationComponent extends DynamicSelectFieldComponentBase<McsLocation> {
  public config: DynamicSelectLocationField;

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

  protected callService(): Observable<McsLocation[]> {
    if (isNullOrEmpty(this._companyId)) { return of([]); }

    let optionalHeaders = new Map<string, any>([
      [CommonDefinition.HEADER_COMPANY_ID, this._companyId]
    ]);

    let param = new McsQueryParam();

    return this._apiService.getLocations(param, optionalHeaders).pipe(
      takeUntil(this.destroySubject),
      map((response) => response && response.collection));
  }

  protected filter(collection: McsLocation[]): FlatOption[] {
    let options: FlatOption[] = [];
    // sort alphabetically
    let items = collection.sort((a, b) => a.name.localeCompare(b.name));

    items.forEach((item) => {
      options.push({ type: 'flat', key: item.name, value: item.name });
    });

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
