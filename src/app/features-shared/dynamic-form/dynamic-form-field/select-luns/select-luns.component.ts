import {
  Component,
  forwardRef,
  ChangeDetectorRef,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { Observable, Subject } from 'rxjs';

import {
  DynamicFormFieldDataChangeEventParam,
  FlatOption
} from '../../dynamic-form-field-config.interface';
import { DynamicSelectFieldComponentBase } from '../dynamic-select-field-component.base';
import { McsNetworkDbPod, McsObjectCrispElement, McsObjectCrispElementService, ProductType } from '@app/models';
import { McsApiService } from '@app/services';
import { map, takeUntil, tap } from 'rxjs/operators';
import { isNullOrEmpty, isNullOrUndefined } from '@app/utilities';
import { DynamicSelectLunsField } from './select-luns';
import { CrispAttributeNames, findCrispElementAttribute } from '@app/features/launch-pad/workflows/workflow/core/forms/mapping-helper';

export interface Luns {
  serviceId: string;
  sizeGb: number;
  tier: string;
  bootLun: boolean;
}

@Component({
  selector: 'mcs-dff-select-luns-field',
  templateUrl: './select-luns.component.html',
  styleUrls: [
    '../dynamic-form-field.scss',
    './select-luns.component.scss'
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DynamicSelectLunsComponent),
      multi: true
    }
  ]
})
export class DynamicSelectLunsComponent extends DynamicSelectFieldComponentBase<McsObjectCrispElementService>{
  public config: DynamicSelectLunsField;
  public multipleBootError: boolean = true;

  public luns: Luns = {
    serviceId: null,
    sizeGb: null,
    tier: null,
    bootLun: true
  }

  public tierOptions = [
    { key: 'SPR', value: 'P700' },
    { key: 'PR2', value: 'P2000' },
    { key: 'PR8', value: 'P8000' },
    { key: 'PR16', value: 'P16000' }
  ];

  private _productId: string = null;
  private _acceptedProductTypes = [
    ProductType[ProductType.PrimaryDedicatedStorage],
    ProductType[ProductType.StretchedDedicatedStorage]
  ];
  private _serviceIdErrorMessage: string = '';

  public constructor(
    private _apiService: McsApiService,
    _changeDetectorRef: ChangeDetectorRef
  ) {
    super(_changeDetectorRef);
  }

  public onLunsChange(): void {
    this.config.value = [this.luns];
    this.valueChange(this.config.value);
  }

  public get serviceIdErrorMessage(): string {
    return this._serviceIdErrorMessage;
  }

  // Override function to get productid from initial mapping
  public writeValue(obj: any): void {
    if (typeof obj === 'string') {
      this._productId = obj;
      this.retrieveOptions();
    }
  }

  public onFormDataChange(params: DynamicFormFieldDataChangeEventParam): void {
    throw new Error('Method not implemented.');
  }

  protected callService(): Observable<McsObjectCrispElementService[]> {
    if (isNullOrUndefined(this._productId)) { return; }
    return this._apiService.getCrispElement(this._productId).pipe(
      takeUntil(this.destroySubject),
      map((response) => {
        return response && response.associatedServices;
      }));
  }

  protected filter(collection: McsObjectCrispElementService[]): FlatOption[] {
    let options: FlatOption[] = [];
    collection.sort((a, b) => a.serviceId.localeCompare(b.serviceId))
      .forEach((item) => {
        if (this._exluded(item)) { return; }
        this._apiService.getCrispElement(item.productId).pipe(
          takeUntil(this.destroySubject),
          tap((crispElement) => {
            let bootService = crispElement.serviceAttributes.find(attr =>
              attr.code === CrispAttributeNames.DesignatedUsage && attr.displayValue === 'BOOT'
            );
            if (!isNullOrUndefined(bootService)) {
              let option: FlatOption = {
                type: 'flat',
                key: item.serviceId,
                value: isNullOrEmpty(item.description) ? item.serviceId : `${item.description} - ${item.serviceId}`
              }
              options.push(option);

              if(options.length === 1){
                this._updateLunValues(crispElement);
              }
              else{
                this._clearLunsValues();
                this.hasError = true;
                this.multipleBootError = true;
                this._serviceIdErrorMessage = 'Exactly one boot LUN must be associated with this element in CRISP.';
              }
            }
          })).subscribe();
      });
    return options;
  }

  private _clearLunsValues(){
    this.luns = {
      serviceId: null,
      sizeGb: null,
      tier: null,
      bootLun: true
    }
    this.config.value = null;
    this.valueChange(this.config.value);
  }

  private _updateLunValues(service: McsObjectCrispElement){
    let sizeGbValue: number = null;
    let tierValue: string = '';
    switch(service.productType.toString()){
      case ProductType[ProductType.PrimaryDedicatedStorage]: {
          let tierMap: Map<string, string> = new Map([
            ['PERFORMANCE-700', 'SPR'],
            ['PERFORMANCE-2000', 'PR2'],
            ['PERFORMANCE-8000', 'PR8'],
            ['PERFORMANCE-16000', 'PR16']
          ]);
          let crispTierValue = findCrispElementAttribute(CrispAttributeNames.Ic2StorageTier, service.serviceAttributes)?.value;
          let ic2DiskSpaceValue = findCrispElementAttribute(CrispAttributeNames.Ic2DiskSpace, service.serviceAttributes)?.displayValue;
          sizeGbValue = isNaN(+ic2DiskSpaceValue) ? null : parseInt(ic2DiskSpaceValue);
          tierValue = isNullOrUndefined(crispTierValue) ? '' : tierMap.get(crispTierValue.toString().toUpperCase());
          break;
        }
        case ProductType[ProductType.StretchedDedicatedStorage]: {
          let tierMap: Map<string, string> = new Map([
            ['PERFORMANCE-700', 'SPR-MAZ'],
            ['PERFORMANCE-2000', 'PR2-MAZ'],
            ['PERFORMANCE-8000', 'PR8-MAZ'],
            ['PERFORMANCE-16000', 'PR16-MAZ']
          ]);
          let crispTierValue = findCrispElementAttribute(CrispAttributeNames.MazaStorageTier, service.serviceAttributes)?.value;
          let ic2DiskSpaceValue = findCrispElementAttribute(CrispAttributeNames.Ic2DiskSpace, service.serviceAttributes)?.displayValue;
          sizeGbValue = isNaN(+ic2DiskSpaceValue) ? null : parseInt(ic2DiskSpaceValue);
          tierValue = isNullOrUndefined(crispTierValue) ? '' : tierMap.get(crispTierValue.toString().toUpperCase());
          break;
        }
    }

    this.luns = {
      serviceId: service.serviceId,
      sizeGb: sizeGbValue,
      tier: tierValue,
      bootLun: true
    }
    this.onLunsChange();
    this.hasError = false;
    this.multipleBootError = false;
  }

  private _exluded(item: McsObjectCrispElementService): boolean {
    if (this._acceptedProductTypes.includes(item.productType.toString()) && !isNullOrUndefined(item.serviceId)) {
      return false;
    }
    return true;
  }
}
