import {
  Component,
  forwardRef,
  ChangeDetectorRef
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { takeUntil, map } from 'rxjs/operators';
import {
  of,
  Observable
} from 'rxjs';

import {
  CommonDefinition,
  isNullOrEmpty,
  isNullOrUndefined
} from '@app/utilities';
import { McsApiService } from '@app/services';
import {
  McsResource,
  McsPhysicalServer,
  McsPhysicalServersQueryParams
} from '@app/models';
import {
  DynamicFormFieldDataChangeEventParam,
  DynamicFormFieldOnChangeEvent,
  FlatOption
} from '../../dynamic-form-field-config.interface';
import { DynamicSelectPhysicalServerField } from './select-physical-server';
import { DynamicSelectFieldComponentBase } from '../dynamic-select-field-component.base';

@Component({
  selector: 'mcs-dff-select-physical-server-field',
  templateUrl: './select-physical-server.component.html',
  styleUrls: [ '../dynamic-form-field.scss' ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DynamicSelectPhysicalServerComponent),
      multi: true
    }
  ],
  host: {
    '(blur)': 'onTouched()'
  }
})
export class DynamicSelectPhysicalServerComponent extends DynamicSelectFieldComponentBase<McsPhysicalServer> {
  public config: DynamicSelectPhysicalServerField;

  private _companyId: string = undefined;
  private _associatedServiceId: string = undefined;
  private _resource: McsResource = undefined;
  // private _isInitialLoad: boolean = true;
  public isFilteredByAssociatedId: boolean = true;

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
        this.isFilteredByAssociatedId = true;
        this.retrieveOptions();
        break;

      case 'service-id-change':
        this._associatedServiceId = params.value;
        this.isFilteredByAssociatedId = true;
        this.retrieveOptions();
        break;

      case 'resource-change':
        this._resource = params.value as McsResource;
        this.isFilteredByAssociatedId = true;
        this.retrieveOptions();
        break;
    }
  }

  protected callService(): Observable<McsPhysicalServer[]> {
    if(isNullOrUndefined(this._companyId) || isNullOrUndefined(this._resource)) { return of([]); }
    let optionalHeaders = new Map<string, any>([
      [CommonDefinition.HEADER_COMPANY_ID, this._companyId]
    ]);

    let param = new McsPhysicalServersQueryParams();
    param.associatedServiceId = this._associatedServiceId;

    return this._apiService.getPhysicalServers(this._resource.id, param, optionalHeaders).pipe(
      takeUntil(this.destroySubject),
      map((response) => {
        if(response.collection.length > 0 || !this.isFilteredByAssociatedId){
          return response && response.collection
        }
        this._associatedServiceId = null;
        this.isFilteredByAssociatedId = false;
        this.retrieveOptions();
      }));
  }

  protected filter(collection: McsPhysicalServer[]): FlatOption[] {
    let options: FlatOption[] = [];

    collection.forEach((item) => {
      let valueText = item.dn;
      if(!isNullOrEmpty(item.usrLbl)) valueText = `${valueText} - ${item.usrLbl}`;
      let hintText = `Serial: ${item.serial}\n Model: ${item.model} \n Total Memory: ${item.totalMemory} GB \n Power: ${item.operPower} association ${item.numOfCores}`;
      options.push({ type: 'flat', key: item.id, value: valueText, hint: hintText });
    });

    return options;
  }

  public notifyForDataChange(eventName: DynamicFormFieldOnChangeEvent, dependents: string[], value?: any): void {
    let dataValue = this.collection.find((item) => item.id === value);
    this.dataChange.emit({
      value: dataValue,
      eventName,
      dependents
    });
  }
}
