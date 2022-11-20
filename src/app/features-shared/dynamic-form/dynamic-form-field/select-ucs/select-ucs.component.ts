import {
  Component,
  forwardRef,
  ChangeDetectorRef
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { Observable } from 'rxjs';
import {
  takeUntil,
  map,
  tap
} from 'rxjs/operators';
import { McsQueryParam, McsResource, McsUcsDomainGroup, McsUcsObject, PlatformType, UcsObjectType } from '@app/models';
import { McsApiService } from '@app/services';
import {
  DynamicFormFieldDataChangeEventParam,
  DynamicFormFieldOnChangeEvent,
  FlatOption,
  GroupedOption,
} from '../../dynamic-form-field-config.interface';
import { DynamicSelectUcsField } from './select-ucs';
import { DynamicSelectFieldComponentBase } from '../dynamic-select-field-component.base';
import { CommonDefinition, isNullOrUndefined } from '@app/utilities';

export interface UcsData {
  ucs: McsUcsObject,
  domainGroupId?: string,
  platformType: string
}

@Component({
  selector: 'mcs-dff-select-ucs-field',
  templateUrl: './select-ucs.component.html',
  styleUrls: ['../dynamic-form-field.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DynamicSelectUcsComponent),
      multi: true
    }
  ],
  host: {
    '(blur)': 'onTouched()'
  }
})
export class DynamicSelectUcsComponent extends DynamicSelectFieldComponentBase<McsUcsObject> {
  public config: DynamicSelectUcsField;

  public domainGroupOptions: FlatOption[] = [];
  public selectedDomainGroupId: string = null;
  public selectedDomainGroup: McsUcsDomainGroup = null;
  public selectedUcs: McsUcsObject = null;
  public resourceList: McsResource[] = [];

  private _companyId: string = '';
  private _isWarningVisible: boolean = false;

  constructor(
    private _apiService: McsApiService,
    _changeDetectorRef: ChangeDetectorRef
  ) {
    super(_changeDetectorRef);
  }

  public get isDomainGroupVisible(): boolean{
    if(isNullOrUndefined(this.selectedUcs)){
      this.selectedUcs = this.collection.find(item => item.id === this.config.value);
      if(this.domainGroupOptions.length === 0){
        this._setDomainGroupOptions(this.selectedUcs);
      }
    }
    return this.selectedUcs?.objectType === UcsObjectType.UcsCentral;
  }

  public get isWarningVisible(): boolean {
    return this._isWarningVisible;
  }

  public onFormDataChange(params: DynamicFormFieldDataChangeEventParam): void {
    switch (params.eventName) {
      case 'company-change':
        this._companyId = params.value;
        this._getResourceList();
        this._configureValidators();
        break;
    }
  }

  protected callService(): Observable<McsUcsObject[]> {
    return this._apiService.getUcsObjects(null).pipe(
      takeUntil(this.destroySubject),
      map((response) => {
        return response && response.collection;
      })
    );
  }

  protected filter(collection: McsUcsObject[]): GroupedOption[] {
    let groupedOptions: GroupedOption[] = [];

    collection.forEach((item) => {
      let groupName = this._getGroupName(UcsObjectType[item.objectType]);
      let existingGroup = groupedOptions.find((opt) => opt.name === groupName);
      let pod = item.podName ? `, ${item.podName}` : '';
      let avpod = item.availabilityZone ? `- ${item.availabilityZone}${pod}` : '';
      let name = `${item.managementName} ${avpod}`;
      let option = { key: item.id, value: name, hint: item.objectType } as FlatOption;

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

  public valueChange(val: any): void {
    this._isWarningVisible = false;
    this.selectedUcs = this.collection.find(item => item.id === val.value);

    if(this.selectedUcs?.objectType === UcsObjectType.UcsDomain){
      this._setWarningVisibility();
    }
    else{
      this._setDomainGroupOptions(this.selectedUcs);
    }

    this.notifyForDataChange(this.config.eventName, this.config.dependents, this.config.value);
    this.propagateChange(this.config.value);
    this.afterDataChange.emit();
  }

  public onDomainGroupChange(val: any): void {
    this.selectedDomainGroup = this.selectedUcs?.domainGroups?.find(dg => dg.id === this.selectedDomainGroupId);
    this._setWarningVisibility();
    this.notifyForDataChange(this.config.eventName, this.config.dependents, this.config.value);
    this.propagateChange(this.config.value);
    this.afterDataChange.emit();
  }

  public notifyForDataChange(eventName: DynamicFormFieldOnChangeEvent, dependents: string[], value?: any): void {
    if (isNullOrUndefined(value)) { return; }
    this.selectedUcs = this.collection.find(item => item.id === this.config.value);
    let dataValue: UcsData = {
      ucs: this.selectedUcs,
      domainGroupId: this.selectedDomainGroupId,
      platformType: this.selectedUcs?.objectType
    }
    this.dataChange.emit({
      value: dataValue,
      eventName,
      dependents
    });
  }

  private _getResourceList() {
    let optionalHeaders = new Map<string, any>([
      [CommonDefinition.HEADER_COMPANY_ID, this._companyId]
    ]);

    let param = new McsQueryParam();
    param.pageSize = CommonDefinition.PAGE_SIZE_MAX;

    this._apiService.getResources(optionalHeaders, param).pipe(
      takeUntil(this.destroySubject),
      tap((response) => {
        let includedPlatformTypes = [PlatformType.UcsCentral, PlatformType.UcsDomain];
        this.resourceList = response.collection?.filter((resource) => includedPlatformTypes.includes(resource.platform));
      })
    ).subscribe();
  }

  private _setWarningVisibility(): void {
    this._isWarningVisible = false;
    let existingUcsOrg: McsResource = null;
    switch(this.selectedUcs.objectType){
      case UcsObjectType.UcsCentral:
        existingUcsOrg = this.resourceList.find(resource =>
          PlatformType[resource.platform] === this.selectedUcs?.objectType
          && resource.availabilityZone === this.selectedDomainGroup?.availabilityZone
          && resource.podName === this.selectedDomainGroup.podName
        );
        break;
      case UcsObjectType.UcsDomain:
        existingUcsOrg = this.resourceList.find(resource =>
          PlatformType[resource.platform] === this.selectedUcs?.objectType
          && resource.availabilityZone === this.selectedUcs?.availabilityZone
          && resource.podName === this.selectedUcs?.podName
        );
        break;
    }
    this._isWarningVisible = !isNullOrUndefined(existingUcsOrg);
  }

  private _setDomainGroupOptions(selected: McsUcsObject) {
    this.selectedDomainGroupId = null;
    this.selectedDomainGroup = null;
    this.domainGroupOptions = [];

    selected?.domainGroups?.forEach((dg) => {
      let pod = dg.podName ? `, ${dg.podName}` : '';
      let avpod = dg.availabilityZone ? `- ${dg.availabilityZone}${pod}` : '';
      let name = `${dg.name} ${avpod}`;
      let option = { key: dg.id, value: name, disabled: !dg.active, hint: dg.active ? '' : 'This domain group is inactive.' } as FlatOption;
      this.domainGroupOptions.push(option);
    });
  }

  private _getGroupName(objectType: string): string {
    switch (objectType) {
      case UcsObjectType.UcsDomain:
        return 'UCS Domains';
      case UcsObjectType.UcsCentral:
        return 'UCS Central Instances';
    }
  }

  private _configureValidators() {
    this.config.ucsValidator = this._ucsValidator.bind(this);
  }

  private _ucsValidator(inputValue: any): boolean {
    switch(UcsObjectType[this.selectedUcs?.objectType]){
      case UcsObjectType.UcsDomain:
        return true;
      case UcsObjectType.UcsCentral:
        return !isNullOrUndefined(this.selectedDomainGroupId);
    }
  }
}