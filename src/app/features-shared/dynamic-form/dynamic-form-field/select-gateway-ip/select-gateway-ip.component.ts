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
  McsNetworkDbNetwork,
  McsNetworkVdcSubnet,
  McsObjectVdcQueryParams,
  McsResource
} from '@app/models';
import {
  DynamicFormFieldDataChangeEventParam,
  DynamicFormFieldOnChangeEvent,
  FlatOption
} from '../../dynamic-form-field-config.interface';
import { DynamicSelectGatewayIpField } from './select-gateway-ip';
import { DynamicSelectFieldComponentBase } from '../dynamic-select-field-component.base';
import { TranslateService } from '@ngx-translate/core';

const defaultPrefixLength = 27;
const prefixMinSelfManaged = 16;
const prefixMinManaged = 26;
const reserveNewSubnetValue = 'Reserve a new subnet';

@Component({
  selector: 'mcs-dff-select-gateway-ip-field',
  templateUrl: './select-gateway-ip.component.html',
  styleUrls: [
    './select-gateway-ip.component.scss',
    '../dynamic-form-field.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DynamicSelectGatewayIpComponent),
      multi: true
    }
  ],
  host: {
    '(blur)': 'onTouched()'
  }
})

export class DynamicSelectGatewayIpComponent extends DynamicSelectFieldComponentBase<McsNetworkVdcSubnet> {

  public config: DynamicSelectGatewayIpField;

  public prefixLength: number = defaultPrefixLength;
  public prefixDisabled: boolean = false;
  public prefixHint: string = '';
  public prefixError: boolean = false;
  public inputError: string = '';

  public networkName: string = '';
  public isNetworkExisting: boolean = true;
  public reserveNewSubnetValue = reserveNewSubnetValue;

  // Filter variables
  private _resource: McsResource;
  private _companyId: string = '';
  private _serviceId: string = '';
  private _network: McsNetworkDbNetwork;

  public constructor(
    private _apiService: McsApiService,
    private _translateService: TranslateService,
    _changeDetectorRef: ChangeDetectorRef
  ) {
    super(_changeDetectorRef);
  }

  public onFormDataChange(params: DynamicFormFieldDataChangeEventParam): void {
    switch (params.eventName) {

      case 'service-id-change':
        this._serviceId = params.value;
        this.retrieveOptions();
        break;

      case 'company-change':
        this._companyId = params.value;
        this.retrieveOptions();
        break;

      case 'resource-change':
        this._reset();
        this._resource = params.value as McsResource;
        this.retrieveOptions();
        this._updateValidators();
        break;

      case 'network-vlan-change':
        this._reset();
        if (typeof params.value === 'string') {
          this.networkName = params.value;
          this.isNetworkExisting = false;
        }
        else {
          this._network = params.value as McsNetworkDbNetwork;
          this.networkName = this._network.name;
          this.isNetworkExisting = true;
        }
        this._updateValidators();
        break;
    }
  }

  private _updatePrefixValidators() {
    this.prefixDisabled = !this._resource.isSelfManaged;
    this.config.prefixValidators.min = this._resource.isSelfManaged ? prefixMinSelfManaged : prefixMinManaged;
    this.prefixLength = defaultPrefixLength;
  }

  public get isInputVisible(): boolean {
    if (isNullOrUndefined(this._resource) || this._resource.isSelfManaged) { return true }
    return this.isNetworkExisting && this.collection.length > 0;
  }

  public get isResourceSelfManaged(): boolean {
    if (isNullOrUndefined(this._resource)) { return false }
    return this._resource.isSelfManaged;
  }

  public onSelectionChange(event: any) {
    if (event.value === this.reserveNewSubnetValue){
      this.prefixDisabled = false;
      return;
    }

    let selectedSubnet = this.collection.find(item => item.gatewayIp === event.value);
    if (!isNullOrUndefined(selectedSubnet)) {
      this.prefixLength = selectedSubnet.prefixLength;
      this.prefixDisabled = true;
    }
  }

  protected callService(): Observable<McsNetworkVdcSubnet[]> {
    if (isNullOrEmpty(this._resource) || isNullOrEmpty(this._companyId)) { return of([]); }

    let queryParam = new McsObjectVdcQueryParams();
    queryParam.vdcId = this._resource.id;
    queryParam.networkServiceId = this._serviceId;
    queryParam.companyId = this._companyId;

    return this._apiService.getVdcNetworkPrecheck(queryParam).pipe(
      takeUntil(this.destroySubject),
      map((response) => {
        return response && response.subnets;
      }));
  }

  public focusOut(value: string) {

    if (CommonDefinition.REGEX_IP_PATTERN.test(value) && CommonDefinition.REGEX_PRIVATE_IP_PATTERN.test(value)) {
      this.hasError = false;
    }
    else {
      this.hasError = true;
      this.inputError = this._translateService.instant('message.invalidIpAddress');
    }

    this.config.value = value;
    this.valueChange(this.config.value);
  }

  protected filter(collection: McsNetworkVdcSubnet[]): FlatOption[] {
    let options: FlatOption[] = [];

    collection.forEach((item) => {
      options.push({
        type: 'flat',
        key: item.gatewayIp,
        value: item.gatewayIp + ' - ' + item.description
      });
    });

    return options;
  }

  private _updateValidators() {
    if (!this.isInputVisible) {
      this.config.validators.required = false;
      this.hasError = false;
      this.prefixDisabled = false;

      this.config.value = null;
      this.valueChange(this.config.value);
    }
    this._updatePrefixValidators();
  }

  private _reset(): void {
    this.config.validators.required = true;
    this.prefixError = false;
    this.prefixHint = '';
    this.prefixLength = defaultPrefixLength;
    this.config.value = undefined;
    this.valueChange(this.config.value);
  }

  public prefixChange() {
    if (this.prefixLength < this.config.prefixValidators.min) {
      this.prefixError = true;
      this.prefixHint = this._translateService.instant('message.validationMin') + this.config.prefixValidators.min;
    }
    else if (this.prefixLength > this.config.prefixValidators.max) {
      this.prefixError = true;
      this.prefixHint = this._translateService.instant('message.validationMax') + this.config.prefixValidators.max;
    }
    else {
      this.prefixError = false;
      this.prefixHint = '';
      this.valueChange(this.config.value);
    }
  }

  public notifyForDataChange(eventName: DynamicFormFieldOnChangeEvent, dependents: string[], value?: any): void {
    let data: McsNetworkVdcSubnet = {
      gatewayIp: value,
      prefixLength: this.prefixLength,
      description: ''
    }

    let subnet = this.collection.find((item) => item.gatewayIp === value);
    if (!isNullOrUndefined(subnet)) { data = subnet; }

    this.dataChange.emit({
      value: data,
      eventName,
      dependents
    });
  }
}
