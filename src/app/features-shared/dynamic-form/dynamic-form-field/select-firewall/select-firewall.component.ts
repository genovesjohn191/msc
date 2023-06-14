import {
  Component,
  forwardRef,
  ChangeDetectorRef
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

import { Observable } from 'rxjs';
import {
  takeUntil,
  map
} from 'rxjs/operators';

import {
  McsFirewall,
  McsQueryParam
} from '@app/models';
import { McsApiService } from '@app/services';
import {
  CommonDefinition,
  isNullOrEmpty
} from '@app/utilities';

import {
  DynamicFormFieldDataChangeEventParam,
  FlatOption,
} from '../../dynamic-form-field-config.interface';
import { DynamicSelectFirewallField } from './select-firewall';
import { DynamicSelectFieldComponentBase } from '../dynamic-select-field-component.base';

@Component({
  selector: 'mcs-dff-select-firewall',
  templateUrl: '../shared-template/select.component.html',
  styleUrls: ['../dynamic-form-field.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DynamicSelectFirewallComponent),
      multi: true
    }
  ],
  host: {
    '(blur)': 'onTouched()'
  }
})
export class DynamicSelectFirewallComponent extends DynamicSelectFieldComponentBase<McsFirewall> {
  public config: DynamicSelectFirewallField;
  private _companyId: string = '';
  private _serviceId: string = '';

  private _hasInitialized: boolean = false;

  constructor(
    private _apiService: McsApiService,
    _changeDetectorRef: ChangeDetectorRef
  ) {
    super(_changeDetectorRef);
  }

  public onFormDataChange(params: DynamicFormFieldDataChangeEventParam): void {
    switch (params.eventName) {
      case 'company-change':
        this._companyId = params.value;
        break;

      case 'service-id-change':
        this._serviceId = params.value;
        this.retrieveOptions();
        break;
    }
  }

  protected callService(): Observable<McsFirewall[]> {    
    let query = new McsQueryParam();

    let optionalHeaders = new Map<string, any>([
      [CommonDefinition.HEADER_COMPANY_ID, this._companyId]
    ]);

    return this._apiService.getFirewalls(query, optionalHeaders).pipe(
      takeUntil(this.destroySubject),
      map((response) => {
        let returnValue = response && response.collection;
        return returnValue;
      })
    );
  }

  protected filter(collection: McsFirewall[]): FlatOption[] {
    let options: FlatOption[] = [];

    collection.forEach((item) => {

      let managementName = !isNullOrEmpty(item.managementName) ? `${item.managementName}` : '';
      let serviceId = !isNullOrEmpty(item.serviceId) ? `(${item.serviceId})` : '';

      let option = {
        type: 'flat',
        key: item.id,
        value: `${ managementName } ${ serviceId }`,
        disabled: this._disableFirewallOption(item)
      } as FlatOption;
      options.push(option);
    });
    
    let matchedServiceId = this.collection?.find((item) => item.serviceId === this._serviceId);
    if (matchedServiceId && !this._hasInitialized) {
      this.config.initialValue = matchedServiceId?.id;
      this.valueChange(this.config.initialValue);
      this._hasInitialized = true;
    }

    return options;
  }

  private _disableFirewallOption(item: McsFirewall): boolean {
    let firewallUpgradeIsAllowed = isNullOrEmpty(item.serviceId) || item.serviceId === this._serviceId;
    if (firewallUpgradeIsAllowed) {
      return false
    }
    return true;
  }
}