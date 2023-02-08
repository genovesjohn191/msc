import {
  ChangeDetectorRef,
  Component,
  forwardRef,
  Injector
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import {
  BehaviorSubject,
  filter,
  map,
  Observable,
  tap
} from 'rxjs';

import {
  McsMatTableContext,
  McsMatTableQueryParam,
  McsTableDataSource2,
  McsTableSelection2
} from '@app/core';
import {
  McsFilterInfo,
  McsVcloudStorageProfile,
  ProductType,
  storageProfileIopsText
} from '@app/models';
import { McsApiService } from '@app/services';
import {
  coerceNumber,
  createObject,
  isNullOrEmpty,
  isNullOrUndefined
} from '@app/utilities';
import { CrispAttributeNames } from '@app/features/launch-pad/workflows/workflow/core/forms/mapping-helper';

import {
  DynamicFormFieldDataChangeEventParam,
  DynamicFormFieldOnChangeEvent
} from '../../dynamic-form-field-config.interface';
import { DynamicFieldComponentBase } from '../dynamic-field-component.base';
import { DynamicTableStorageProfileField } from './table-storage-profile';

interface Storage {
  serviceId: string;
  limitMB: number;
  iops: number;
  default: boolean;
}

@Component({
  selector: 'mcs-dff-table-storage-profile-field',
  templateUrl: './table-storage-profile.component.html',
  styleUrls: ['../dynamic-form-field.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DynamicTableStorageProfileComponent),
      multi: true
    }
  ],
  host: {
    '(blur)': 'onTouched()'
  }
})

export class DynamicTableStorageProfileComponent extends DynamicFieldComponentBase {
  public config: DynamicTableStorageProfileField;

  public selectedDefaultStorage: McsVcloudStorageProfile = null;
  public storage: Storage[];
  public showField: boolean = true;

  private _storageProfiles: McsVcloudStorageProfile[];
  private _storageItemsChange = new BehaviorSubject<McsVcloudStorageProfile[]>(null);

  public readonly dataSource: McsTableDataSource2<McsVcloudStorageProfile>;
  public readonly dataSelection: McsTableSelection2<McsVcloudStorageProfile>;
  public readonly defaultColumnFilters: McsFilterInfo[] = [
    createObject(McsFilterInfo, { value: true, exclude: true, id: 'provision' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'default' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'serviceId' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'size' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'tier' })
  ];

  constructor(
    _injector: Injector,
    private _changeDetectorRef: ChangeDetectorRef,
    private _apiService: McsApiService
  ) {
    super();
    this.dataSource = new McsTableDataSource2(this._getCrispElements.bind(this));
    this.dataSelection = new McsTableSelection2(this.dataSource, true);
    this.dataSource.registerColumnsFilterInfo(this.defaultColumnFilters);
  }

  public get getSelectedStorageProfiles(): McsVcloudStorageProfile[] {
    return this.dataSelection.getSelectedItems();
  }

  public retryDatasource(): void {
    this.dataSource.refreshDataRecords();
  }

  public onFormDataChange(params: DynamicFormFieldDataChangeEventParam): void {
    switch (params.eventName) {
      case 'vcloud-instance-change':
        this._updateSelectedStorage();
        if (params.value === '') { 
          this.showField = false;
          return;
        }
        this.showField = true;
        break;

      case 'company-change':
        if (this._storageProfiles?.length > 0) { return; }
        this._updateDataSource();
        break;
    }
  }

  public onDefaultStorageChange(row: McsVcloudStorageProfile) {
    this.selectedDefaultStorage = row;
    this._setFieldValue();
  }

  public onStorageProfileSelectionChange(row: McsVcloudStorageProfile): void {
    this.dataSelection.toggleItemSelection(row);
    let selectedDefaultStorage = this._findSelectedDefaultStorage(this.selectedDefaultStorage?.serviceId);
    if (isNullOrEmpty(selectedDefaultStorage)) {
      this.selectedDefaultStorage = null
    }

    if (this.getSelectedStorageProfiles?.length === 1) {
      this.selectedDefaultStorage = this.getSelectedStorageProfiles[0];
    }
    this._setFieldValue();
  }

  public validToSelectStorageProfile(item: McsVcloudStorageProfile): boolean {
    return !isNullOrEmpty(item.serviceId) && !isNullOrEmpty(item.tier) && !isNullOrEmpty(item.size);
  }

  public rowIsIncludedInSelectedStorageProfile(row: McsVcloudStorageProfile): boolean {
    let selectedDefaultStorage = this._findSelectedDefaultStorage(row?.serviceId);
    return !isNullOrEmpty(selectedDefaultStorage);
  }

  private _findSelectedDefaultStorage(serviceId: string): McsVcloudStorageProfile {
    return this.getSelectedStorageProfiles?.find((item) =>  item.serviceId === serviceId);
  }

  private _updateSelectedStorage(): void {
    if (this.config?.value?.length === 0) {
      this._clearSelectedStorage();
    } else {
      this.config?.value?.forEach((storage) => {
        let selectedStorage = this._storageProfiles?.find((item) => {
          return item.serviceId === storage?.serviceId;
        });
        if (storage.default === true) {
          this.selectedDefaultStorage = selectedStorage;
        }
        this.dataSelection.toggleItemSelection(selectedStorage);
        this.dataSelection.selectItem(selectedStorage);        
      });
      
      this._changeDetectorRef.markForCheck();
    }
  }

  private _clearSelectedStorage(): void {
    this.dataSelection.clearAllSelection();
    this.selectedDefaultStorage = null;
  }
  
  private _setFieldValue(): void {
    this.storage = [];
    if (this.getSelectedStorageProfiles?.length === 0) {
      this.config.value = null;
    } else {
      let defaultStorage = this._findSelectedDefaultStorage(this.selectedDefaultStorage.serviceId);
      this.getSelectedStorageProfiles.forEach((storage) => {
        this.storage.push({
          serviceId: storage.serviceId,
          limitMB: coerceNumber(storage.size) * 1024,
          iops: this._mapIopsValueToEnum(storage.tier),
          default: storage.serviceId === defaultStorage.serviceId
        })
      })
      this.config.value = this.storage;
    }
    this.valueChange(this.config.value);
  }

  public notifyForDataChange(eventName: DynamicFormFieldOnChangeEvent, dependents: string[], value?: any): void {
    this.dataChange.emit({
      value: value,
      eventName,
      dependents
    });
  }

  private _mapIopsValueToEnum(tierValue: string): number {
    return coerceNumber(storageProfileIopsText[tierValue]);
  }

  private _getCrispElements(_param: McsMatTableQueryParam): Observable<McsMatTableContext<McsVcloudStorageProfile>> {
    return this._storageItemsChange.pipe(
      filter(response => !isNullOrUndefined(response)),
      map(response => new McsMatTableContext(response, response?.length))
    );
  }

  private _updateDataSource(): void {
    let configNotInitialized = isNullOrEmpty(this.config?.productId) || this.config?.associatedServices.length === 0;
    if (configNotInitialized) { return; }
    
    let validProductTypes = this.config?.associatedServices?.filter((service) => {
      let serviceProductType = service.productType as ProductType;
      return serviceProductType.toString() === ProductType[ProductType.VdcStorage] ||
        serviceProductType.toString() === ProductType[ProductType.StretchedVirtualDataCentreStorage];
    });
    
    if (isNullOrEmpty(validProductTypes)) { return; }

    let storageProfiles: McsVcloudStorageProfile[] = [];

    validProductTypes.forEach((item) => {
      this._apiService.getCrispElement(item.productId).pipe(
        tap((response) => {
          let sizeValue = response?.serviceAttributes?.find((attrib) => attrib.code === CrispAttributeNames.ProvisionQuotaGib2)?.value;
          let tierValue = response?.serviceAttributes?.find((attrib) => attrib.code === CrispAttributeNames.Ic2StorageTier)?.value;
          let row: McsVcloudStorageProfile = {
            serviceId: response.serviceId,
            size: coerceNumber(sizeValue) || 0,
            tier: tierValue?.toString() || ''
          };

          storageProfiles.push(row);
        })
      ).subscribe(() => {
        this._storageProfiles = storageProfiles;
        let storageItems = storageProfiles?.length === 0 ? [] : storageProfiles;
        this._storageItemsChange.next(storageItems);
      });
    });    
  }
}
