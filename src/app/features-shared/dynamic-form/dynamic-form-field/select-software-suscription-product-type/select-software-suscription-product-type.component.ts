import {
  Component,
  forwardRef,
  ChangeDetectorRef
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { takeUntil, map } from 'rxjs/operators';
import { Observable } from 'rxjs';

import { isNullOrEmpty } from '@app/utilities';
import { McsApiService } from '@app/services';
import { McsSoftwareSubscriptionProductTypeQueryParams } from '@app/models';
import {
  DynamicFormFieldDataChangeEventParam,
  DynamicFormFieldOnChangeEvent,
  FlatOption
} from '../../dynamic-form-field-config.interface';
import { DynamicSelectFieldComponentBase } from '../dynamic-select-field-component.base';
import { DynamicSelectSoftwareSubscriptionProductTypeField } from './select-software-suscription-product-type';
import { McsSoftwareSubscriptionProductType } from '@app/models/response/mcs-software-subscription-product-type';

@Component({
  selector: 'mcs-dff-select-software-subscription-product-type-field',
  templateUrl: '../shared-template/select.component.html',
  styleUrls: [ '../dynamic-form-field.scss' ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DynamicSelectSoftwareSubscriptionProductTypeComponent),
      multi: true
    }
  ],
  host: {
    '(blur)': 'onTouched()'
  }
})
export class DynamicSelectSoftwareSubscriptionProductTypeComponent
extends DynamicSelectFieldComponentBase<McsSoftwareSubscriptionProductType> {

  public config: DynamicSelectSoftwareSubscriptionProductTypeField;

  // Filter variables
  private _skuId: string = '';
  private _productId: string = '';

  public constructor(
    private _apiService: McsApiService,
    _changeDetectorRef: ChangeDetectorRef
  ) {
    super(_changeDetectorRef);
  }

  public onFormDataChange(params: DynamicFormFieldDataChangeEventParam): void {
    switch (params.eventName) {

      case 'sku-id-change':
        this._skuId = params.value;
        this.retrieveOptions();
        break;
      case 'microsoft-product-id-change':
        this._productId = params.value;
        this.retrieveOptions();
        break;
    }
  }

  protected callService(): Observable<McsSoftwareSubscriptionProductType[]> {
    let queryParam = new McsSoftwareSubscriptionProductTypeQueryParams();
    queryParam.pageIndex = 1;
    queryParam.pageSize = 500;
    queryParam.skuId = this._skuId;
    queryParam.productId = this._productId;

    return this._apiService.getSoftwareSubscriptionProductTypes(queryParam).pipe(
      takeUntil(this.destroySubject),
      map((response) => response && response.collection));
  }

  protected filter(collection: McsSoftwareSubscriptionProductType[]): FlatOption[] {
    let options: FlatOption[] = [];

    collection.forEach((item) => {
      options.push({ type: 'flat', key: item.catalogItemId, value: item.skuName });
    });

    let initializedArtificially = options.length === 1 && !isNullOrEmpty(this._skuId) && !isNullOrEmpty(this._productId);
    if (initializedArtificially) {
      this.config.initialValue = options[0].key;
    }

    return options;
  }

  public notifyForDataChange(eventName: DynamicFormFieldOnChangeEvent, dependents: string[], value?: any): void {
    this.dataChange.emit({
      value: this.collection.find((item) => item.catalogItemId === value),
      eventName,
      dependents
    });
  }
}
