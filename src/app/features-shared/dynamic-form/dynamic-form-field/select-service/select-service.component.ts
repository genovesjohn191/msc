import {
  Component,
  forwardRef,
  ChangeDetectorRef
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { takeUntil, map, tap, catchError } from 'rxjs/operators';
import {
  of,
  Observable
} from 'rxjs';

import {
  isNullOrEmpty,
  isNullOrUndefined
} from '@app/utilities';
import { McsApiService } from '@app/services';
import {
  McsObjectCrispObject,
  McsObjectQueryParams,
  ProductType
} from '@app/models';
import {
  DynamicFormFieldDataChangeEventParam,
  DynamicFormFieldOnChangeEvent,
  FlatOption
} from '../../dynamic-form-field-config.interface';
import { DynamicSelectServiceField } from './select-service';
import { DynamicInputAutocompleteFieldComponentBase } from '../dynamic-input-autocomplete-component.base';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';

@Component({
  selector: 'mcs-dff-select-service-field',
  templateUrl: '../shared-template/input-autocomplete.component.html',
  styleUrls: [ '../dynamic-form-field.scss' ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DynamicSelectServiceComponent),
      multi: true
    }
  ],
  host: {
    '(blur)': 'onTouched()'
  }
})
export class DynamicSelectServiceComponent extends DynamicInputAutocompleteFieldComponentBase<McsObjectCrispObject> {
  public config: DynamicSelectServiceField;

  // Filter variables
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
        this.config.value = '';
        this.inputCtrl.setValue('');
        this.valueChange(this.config.value);
        this.retrieveOptions();
        break;
    }
  }

  public setValue(value: string): void {
    value = value?.trim();
    if(!isNullOrEmpty(value) && this.config.pattern.test(value)){
      this._trySetValue(value);
    }
    else {
      this._trySetValue('');
    }
  }

  private _trySetValue(value: string): void {
    this.config.value = value;
    this.valueChange(this.config.value);
  }

  public search(selectedOption: string): Observable<FlatOption[]> {
    if (typeof selectedOption === 'object') {
      return of(this.config.options.filter(option => option.key.indexOf(option.key) === 0));
    }

    const filterValue = selectedOption.toLowerCase();

    return of(this.config.options.filter(option =>
      option.value.toLowerCase().indexOf(filterValue) >= 0
      || option.key.toLowerCase().indexOf(filterValue) >= 0));
  }

  public selected(event: MatAutocompleteSelectedEvent): void {
    let option = event.option.value as FlatOption;
    this._trySetValue(option.value);
  }

  public getOptionValue(opt: FlatOption) {
    if (isNullOrEmpty(opt)) { return }
    return opt.value;
  }

  protected callService(): Observable<McsObjectCrispObject[]> {
    if (isNullOrEmpty(this._companyId)) { return of([]); }

    let queryParam = new McsObjectQueryParams();
    if(!isNullOrEmpty(this._companyId)) { queryParam.companyId = this._companyId; }
    if(!isNullOrUndefined(this.config.productType)) {
      queryParam.productType = ProductType[this.config.productType];
    }

    return this._apiService.getCrispObjects(queryParam).pipe(
      takeUntil(this.destroySubject),
      map((response) => {
        return response && response.collection;
      }));
  }

  protected filter(collection: McsObjectCrispObject[]): FlatOption[] {
    let options: FlatOption[] = [];

    let deduplicatedList = collection.filter((e, i) => {
      return collection.findIndex((x) => { return x.serviceId === e.serviceId }) === i;
    });

    deduplicatedList.forEach((item) => {
      options.push({ type: 'flat', key: item.serviceId, value: item.serviceId });
    });

    return options;
  }

  public notifyForDataChange(eventName: DynamicFormFieldOnChangeEvent, dependents: string[], value?: any): void {
    if (!isNullOrEmpty(value) && !isNullOrUndefined(this.config.value)) {
      this.dataChange.emit({
        value: isNullOrUndefined(value) ? this.config.value : value,
        eventName,
        dependents
      });
    }
  }
}
